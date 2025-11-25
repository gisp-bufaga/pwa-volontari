"""
Utility functions for user management
"""

import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def generate_random_password(length=12):
    """
    Generate a random secure password
    
    Args:
        length (int): Length of the password
        
    Returns:
        str: Random password
    """
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Ensure password has at least one of each: uppercase, lowercase, digit, special char
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    
    # Fill the rest randomly
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    
    # Shuffle
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


def send_credentials_email(user, password, is_new=True):
    """
    Send credentials email to user
    
    Args:
        user (User): User instance
        password (str): Plain text password
        is_new (bool): Whether this is a new account or password reset
        
    Returns:
        bool: True if email sent successfully
    """
    subject = 'Credenziali di Accesso' if is_new else 'Reset Password'
    
    # Try to render email template, fallback to simple text
    try:
        message = render_to_string('emails/credentials.html', {
            'user': user,
            'password': password,
            'is_new': is_new,
            'login_url': settings.FRONTEND_URL + '/login',
        })
    except:
        # Fallback to plain text
        if is_new:
            message = f"""
Ciao {user.get_full_name() or user.username},

Benvenuto/a! Di seguito trovi le tue credenziali di accesso:

Username: {user.username}
Password: {password}

Accedi al sistema: {settings.FRONTEND_URL}/login

Ti consigliamo di cambiare la password al primo accesso.

Cordiali saluti,
Il Team
            """
        else:
            message = f"""
Ciao {user.get_full_name() or user.username},

La tua password è stata resettata. Di seguito trovi le tue nuove credenziali:

Username: {user.username}
Nuova Password: {password}

Accedi al sistema: {settings.FRONTEND_URL}/login

Ti consigliamo di cambiare la password al primo accesso.

Cordiali saluti,
Il Team
            """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email to {user.email}: {str(e)}")
        return False


def send_bulk_credentials_emails(users_with_passwords):
    """
    Send credentials emails to multiple users
    
    Args:
        users_with_passwords (list): List of tuples (user, password)
        
    Returns:
        dict: Summary with success and failure counts
    """
    success_count = 0
    failed_emails = []
    
    for user, password in users_with_passwords:
        if send_credentials_email(user, password, is_new=True):
            success_count += 1
        else:
            failed_emails.append(user.email)
    
    return {
        'success_count': success_count,
        'failed_count': len(failed_emails),
        'failed_emails': failed_emails,
        'total': len(users_with_passwords)
    }