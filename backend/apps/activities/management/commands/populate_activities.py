from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from apps.users.models import User, WorkArea
from apps.activities.models import Activity, Shift
import random


class Command(BaseCommand):
    help = 'Popola il database con dati di esempio per Activities'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina tutti i dati esistenti prima di popolare',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Eliminazione dati esistenti...')
            Shift.objects.all().delete()
            Activity.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Dati eliminati'))

        self.stdout.write('Inizio popolamento Activities...')

        # Ottieni utenti per created_by
        try:
            superadmin = User.objects.filter(role='superadmin').first()
            
            # Ottieni WorkArea
            area_segreteria = WorkArea.objects.filter(code='segreteria').first()
            area_pc = WorkArea.objects.filter(code='protezione_civile').first()
            
            # Trova admin per area
            admin_segreteria = None
            admin_pc = None
            
            if area_segreteria:
                admin_segreteria = User.objects.filter(
                    role='admin',
                    work_areas=area_segreteria
                ).first()
            
            if area_pc:
                admin_pc = User.objects.filter(
                    role='admin',
                    work_areas=area_pc
                ).first()
            
            if not superadmin:
                self.stdout.write(self.style.ERROR('Nessun superadmin trovato. Crea prima un utente superadmin.'))
                return
            
            # Usa superadmin come fallback
            default_creator = admin_segreteria or superadmin
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Errore nel recupero utenti: {e}'))
            return

        # Ottieni tutte le aree disponibili
        work_areas = list(WorkArea.objects.all())
        if not work_areas:
            self.stdout.write(self.style.ERROR('Nessuna area di lavoro trovata. Esegui prima le migration di users.'))
            return

        # Mappa code -> nome per reference
        area_map = {wa.code: wa.name for wa in work_areas}

        # Attività per area - usa i code delle WorkArea
        activities_data = [
            # Protezione Civile
            {
                'nome': 'Servizio 118',
                'descrizione': 'Supporto ambulanze per emergenze sanitarie',
                'area': 'protezione_civile',
                'colore_hex': '#e53935',
                'link_iscrizione': 'https://forms.google.com/servizio-118',
            },
            {
                'nome': 'Antincendio Boschivo',
                'descrizione': 'Prevenzione e contrasto incendi boschivi',
                'area': 'protezione_civile',
                'colore_hex': '#ff6f00',
                'link_iscrizione': 'https://forms.google.com/antincendio',
            },
            {
                'nome': 'Protezione Civile - Emergenze',
                'descrizione': 'Interventi in caso di calamità naturali',
                'area': 'protezione_civile',
                'colore_hex': '#1565c0',
                'link_iscrizione': None,
            },
            # Sociale
            {
                'nome': 'Assistenza Anziani',
                'descrizione': 'Supporto domiciliare e compagnia per anziani',
                'area': 'sociale',
                'colore_hex': '#43a047',
                'link_iscrizione': 'https://forms.google.com/assistenza-anziani',
            },
            {
                'nome': 'Banco Alimentare',
                'descrizione': 'Raccolta e distribuzione alimentari',
                'area': 'sociale',
                'colore_hex': '#fb8c00',
                'link_iscrizione': 'https://forms.google.com/banco-alimentare',
            },
            {
                'nome': 'Doposcuola',
                'descrizione': 'Supporto scolastico per bambini',
                'area': 'sociale',
                'colore_hex': '#8e24aa',
                'link_iscrizione': None,
            },
            # Sanitaria
            {
                'nome': 'Trasporto Sanitario',
                'descrizione': 'Trasporti programmati per visite mediche',
                'area': 'sanitaria',
                'colore_hex': '#00897b',
                'link_iscrizione': 'https://forms.google.com/trasporto-sanitario',
            },
            {
                'nome': 'Punto Primo Soccorso',
                'descrizione': 'Presidio sanitario eventi pubblici',
                'area': 'sanitaria',
                'colore_hex': '#d32f2f',
                'link_iscrizione': None,
            },
            # Formazione
            {
                'nome': 'Corso BLSD',
                'descrizione': 'Corso Basic Life Support and Defibrillation',
                'area': 'formazione',
                'colore_hex': '#5e35b1',
                'link_iscrizione': 'https://forms.google.com/corso-blsd',
            },
            {
                'nome': 'Formazione Nuovi Volontari',
                'descrizione': 'Corso introduttivo per neo-volontari',
                'area': 'formazione',
                'colore_hex': '#3949ab',
                'link_iscrizione': 'https://forms.google.com/nuovi-volontari',
            },
            # Segreteria
            {
                'nome': 'Supporto Amministrativo',
                'descrizione': 'Gestione pratiche amministrative',
                'area': 'segreteria',
                'colore_hex': '#6d4c41',
                'link_iscrizione': None,
            },
        ]

        created_activities = []
        for act_data in activities_data:
            # Verifica che l'area esista
            area_code = act_data['area']
            if area_code not in [wa.code for wa in work_areas]:
                self.stdout.write(self.style.WARNING(f'⚠ Area "{area_code}" non trovata, skip attività: {act_data["nome"]}'))
                continue
            
            activity = Activity.objects.create(
                nome=act_data['nome'],
                descrizione=act_data['descrizione'],
                area=area_code,
                colore_hex=act_data['colore_hex'],
                link_iscrizione=act_data['link_iscrizione'],
                created_by=admin_pc if area_code == 'protezione_civile' else default_creator,
                is_active=True
            )
            created_activities.append(activity)
            self.stdout.write(f'✓ Creata attività: {activity.nome} ({area_code})')

        # Crea turni per le prossime 8 settimane
        self.stdout.write('\nCreazione turni...')
        oggi = timezone.now().date()
        
        turni_templates = [
            {'ora_inizio': '08:00', 'ora_fine': '14:00', 'posti': 2},
            {'ora_inizio': '14:00', 'ora_fine': '20:00', 'posti': 2},
            {'ora_inizio': '20:00', 'ora_fine': '08:00', 'posti': 3},  # Notturno
            {'ora_inizio': '09:00', 'ora_fine': '13:00', 'posti': 1},
            {'ora_inizio': '15:00', 'ora_fine': '19:00', 'posti': 1},
        ]

        turni_count = 0
        for activity in created_activities:
            # Numero casuale di turni per attività (tra 5 e 15)
            num_turni = random.randint(5, 15)
            
            for i in range(num_turni):
                # Data casuale nelle prossime 8 settimane
                giorni_offset = random.randint(0, 56)
                data_turno = oggi + timedelta(days=giorni_offset)
                
                # Template turno casuale
                template = random.choice(turni_templates)
                
                # 30% possibilità di link specifico per turno
                link_specifico = None
                if random.random() < 0.3:
                    link_specifico = f"https://forms.google.com/turno-{activity.id}-{i}"
                
                shift = Shift.objects.create(
                    attivita=activity,
                    titolo=f"{activity.nome} - Turno {data_turno.strftime('%d/%m')}",
                    data=data_turno,
                    ora_inizio=template['ora_inizio'],
                    ora_fine=template['ora_fine'],
                    posti_disponibili=template['posti'],
                    link_iscrizione=link_specifico,
                    note=f"Turno {template['ora_inizio']}-{template['ora_fine']}" if random.random() < 0.3 else "",
                    is_active=True,
                    created_by=activity.created_by
                )
                turni_count += 1

        self.stdout.write(self.style.SUCCESS(f'\n✓ Creati {len(created_activities)} attività'))
        self.stdout.write(self.style.SUCCESS(f'✓ Creati {turni_count} turni'))
        self.stdout.write(self.style.SUCCESS('\n🎉 Popolamento Activities completato!'))