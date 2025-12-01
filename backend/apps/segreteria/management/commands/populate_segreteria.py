from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, WorkArea
from apps.segreteria.models import Todo, Document
import random


class Command(BaseCommand):
    help = 'Popola il database con dati di esempio per Segreteria'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina tutti i dati esistenti prima di popolare',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Eliminazione dati esistenti...')
            Todo.objects.all().delete()
            Document.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Dati eliminati'))

        self.stdout.write('Inizio popolamento Segreteria...')

        # Ottieni utenti
        try:
            superadmin = User.objects.filter(role='superadmin').first()
            
            # Ottieni WorkArea segreteria
            area_segreteria = WorkArea.objects.filter(code='segreteria').first()
            
            admin_segreteria = None
            if area_segreteria:
                admin_segreteria = User.objects.filter(
                    role='admin',
                    work_areas=area_segreteria
                ).first()
            
            # Lista di tutti gli admin
            admins = list(User.objects.filter(role='admin'))
            
            if not superadmin and not admin_segreteria:
                self.stdout.write(self.style.ERROR('Nessun admin trovato. Crea prima degli utenti admin.'))
                return
            
            creator = admin_segreteria or superadmin
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Errore nel recupero utenti: {e}'))
            return

        # To-Do templates
        todos_data = [
            {
                'titolo': 'Preparare report mensile attività',
                'descrizione': 'Compilare statistiche e report per il mese corrente',
                'status': 'in_progress',
                'priorita': 'high',
            },
            {
                'titolo': 'Rinnovare assicurazione mezzi',
                'descrizione': 'Contattare assicurazione per rinnovo polizze veicoli',
                'status': 'todo',
                'priorita': 'high',
            },
            {
                'titolo': 'Organizzare riunione coordinatori',
                'descrizione': 'Fissare data e inviare convocazioni',
                'status': 'todo',
                'priorita': 'medium',
            },
            {
                'titolo': 'Aggiornare organigramma',
                'descrizione': 'Inserire nuovi volontari e aggiornare cariche',
                'status': 'in_progress',
                'priorita': 'medium',
            },
            {
                'titolo': 'Verificare scadenze corsi',
                'descrizione': 'Controllare attestati in scadenza',
                'status': 'todo',
                'priorita': 'low',
            },
            {
                'titolo': 'Archiviare documenti 2024',
                'descrizione': 'Sistemare archivio documentale anno precedente',
                'status': 'done',
                'priorita': 'low',
            },
            {
                'titolo': 'Pianificare evento raccolta fondi',
                'descrizione': 'Organizzare iniziativa benefica primaverile',
                'status': 'todo',
                'priorita': 'medium',
            },
            {
                'titolo': 'Revisione regolamento interno',
                'descrizione': 'Aggiornare regolamento con nuove normative',
                'status': 'in_progress',
                'priorita': 'high',
            },
            {
                'titolo': 'Inventario materiale magazzino',
                'descrizione': 'Controllo e aggiornamento inventario DPI',
                'status': 'todo',
                'priorita': 'medium',
            },
            {
                'titolo': 'Acquistare materiale sanitario',
                'descrizione': 'Rifornimento presidi medici e garze',
                'status': 'done',
                'priorita': 'high',
            },
        ]

        todos_created = []
        for todo_data in todos_data:
            # Assegna casualmente a un admin
            assegnato = random.choice(admins) if admins and random.random() < 0.7 else None
            
            todo = Todo.objects.create(
                **todo_data,
                assegnato_a=assegnato,
                created_by=creator
            )
            
            # Se completato, aggiungi data completamento
            if todo.status == 'done':
                todo.completed_at = timezone.now() - timedelta(days=random.randint(1, 30))
                todo.save()
            
            todos_created.append(todo)
            self.stdout.write(f'✓ Creato to-do: {todo.titolo}')

        # Documenti templates
        documents_data = [
            {
                'titolo': 'Organigramma 2025',
                'descrizione': 'Struttura organizzativa aggiornata',
                'categoria': 'organigramma',
                'visibile_a': 'tutti',
            },
            {
                'titolo': 'Regolamento Interno',
                'descrizione': 'Regolamento dell\'associazione - versione 2.0',
                'categoria': 'regolamento',
                'visibile_a': 'tutti',
            },
            {
                'titolo': 'Guida Nuovi Volontari',
                'descrizione': 'Manuale di benvenuto per neo-iscritti',
                'categoria': 'guida',
                'visibile_a': 'tutti',
            },
            {
                'titolo': 'Modulo Richiesta Rimborso',
                'descrizione': 'Template per richieste rimborso spese',
                'categoria': 'modulo',
                'visibile_a': 'tutti',
            },
            {
                'titolo': 'Verbale Assemblea Gennaio 2025',
                'descrizione': 'Resoconto assemblea soci',
                'categoria': 'verbale',
                'visibile_a': 'admin',
            },
            {
                'titolo': 'Procedura Attivazione Emergenza',
                'descrizione': 'Protocollo operativo per emergenze',
                'categoria': 'guida',
                'visibile_a': 'admin',
            },
            {
                'titolo': 'Credenziali Sistema Radio',
                'descrizione': 'Codici e frequenze radio operative',
                'categoria': 'altro',
                'visibile_a': 'segreteria',
            },
            {
                'titolo': 'Contratti Fornitori',
                'descrizione': 'Documentazione contratti attivi',
                'categoria': 'altro',
                'visibile_a': 'segreteria',
            },
        ]

        documents_created = []
        for doc_data in documents_data:
            # Crea un file fittizio (in produzione sarebbero file reali)
            fake_content = f"Contenuto documento: {doc_data['titolo']}\n\nQuesto è un documento di esempio."
            fake_file = ContentFile(fake_content.encode('utf-8'))
            
            document = Document.objects.create(
                titolo=doc_data['titolo'],
                descrizione=doc_data['descrizione'],
                categoria=doc_data['categoria'],
                visibile_a=doc_data['visibile_a'],
                uploaded_by=creator
            )
            
            # Salva il file
            document.file.save(
                f"{doc_data['titolo'].lower().replace(' ', '_')}.txt",
                fake_file,
                save=True
            )
            
            documents_created.append(document)
            self.stdout.write(f'✓ Creato documento: {document.titolo}')

        self.stdout.write(self.style.SUCCESS(f'\n✓ Creati {len(todos_created)} to-do'))
        self.stdout.write(self.style.SUCCESS(f'✓ Creati {len(documents_created)} documenti'))
        self.stdout.write(self.style.SUCCESS('\n🎉 Popolamento Segreteria completato!'))