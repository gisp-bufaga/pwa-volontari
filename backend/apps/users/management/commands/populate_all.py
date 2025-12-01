from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Popola l\'intero database con dati di esempio'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina tutti i dati esistenti prima di popolare',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('POPOLAMENTO DATABASE COMPLETO'))
        self.stdout.write(self.style.WARNING('=' * 60))

        # Activities
        self.stdout.write('\n📋 POPOLAMENTO ACTIVITIES')
        self.stdout.write('-' * 60)
        call_command('populate_activities', '--clear' if options['clear'] else '')

        # Segreteria
        self.stdout.write('\n📄 POPOLAMENTO SEGRETERIA')
        self.stdout.write('-' * 60)
        call_command('populate_segreteria', '--clear' if options['clear'] else '')

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('🎉 POPOLAMENTO COMPLETO TERMINATO!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('\nPuoi ora testare l\'applicazione con dati di esempio.')
        self.stdout.write('Accedi a http://localhost:8000/api/docs/ per esplorare le API.\n')