from django.db import migrations, models


def seed_homepage_blocks(apps, schema_editor):
    UIBlock = apps.get_model("portfolio", "UIBlock")
    defaults = [
        ("hero_badge", "Fullstack Delivery · 152-FZ Compliant · PWA Ready", "Fullstack Delivery · 152-FZ Compliant · PWA Ready"),
        ("hero_h1", "Building Digital Products with Logic & Strategy.", "Building Digital Products with Logic & Strategy."),
        ("hero_sub", "Fullstack Developer & Performance Marketer. Shipping spatial, glassy experiences with measurable business impact.", "Fullstack Developer & Performance Marketer. Shipping spatial, glassy experiences with measurable business impact."),
        ("cta_primary", "View Work", "View Work"),
        ("cta_secondary", "GitHub", "GitHub"),
        ("stack_title", "The “Infinite” Stack", "The “Infinite” Stack"),
        ("stack_items", "Next.js,Django,Docker,Figma,Yandex.Metrika,PostgreSQL", "Next.js,Django,Docker,Figma,Yandex.Metrika,PostgreSQL"),
        ("services_title", "Services", "Services"),
        ("service_1_title", "Fullstack Development", "Fullstack Development"),
        ("service_2_title", "Performance Marketing", "Performance Marketing"),
        ("service_3_title", "Speed & SEO", "Speed & SEO"),
        ("service_4_title", "My Philosophy", "My Philosophy"),
        ("service_4_body", "Ship fast, measure, and iterate. I blend product sense with analytics, keep privacy compliant (152-FZ), and push for Lighthouse-grade performance on every deploy.", "Ship fast, measure, and iterate. I blend product sense with analytics, keep privacy compliant (152-FZ), and push for Lighthouse-grade performance on every deploy."),
        ("featured_title", "Featured Projects", "Featured Projects"),
        ("featured_1_title", "AI Marketing Dashboard", "AI Marketing Dashboard"),
        ("featured_1_desc", "Realtime campaign insights with automated scoring and alerts.", "Realtime campaign insights with automated scoring and alerts."),
        ("featured_1_tags", "Next.js,Django,PostgreSQL", "Next.js,Django,PostgreSQL"),
        ("featured_2_title", "PWA Portfolio Engine", "PWA Portfolio Engine"),
        ("featured_2_desc", "Offline-first portfolio with 100/100 Lighthouse and granular analytics consent.", "Offline-first portfolio with 100/100 Lighthouse and granular analytics consent."),
        ("featured_2_tags", "PWA,Serwist,Next-intl", "PWA,Serwist,Next-intl"),
        ("cta_title", "Let’s Talk", "Let’s Talk"),
        ("cta_sub", "Have a product to launch or optimize? Let’s craft it.", "Have a product to launch or optimize? Let’s craft it."),
    ]

    for key, content_ru, content_en in defaults:
        UIBlock.objects.get_or_create(
            section="HOMEPAGE",
            key=key,
            defaults={
                "description": f"Homepage block: {key}",
                "content": content_ru,
                "content_ru": content_ru,
                "content_en": content_en,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0004_cleanup_modeltranslation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='uiblock',
            name='section',
            field=models.CharField(choices=[('HOMEPAGE', 'Homepage'), ('FOOTER', 'Footer'), ('GLOBAL', 'Global')], db_index=True, max_length=100),
        ),
        migrations.RunPython(seed_homepage_blocks, migrations.RunPython.noop),
    ]


