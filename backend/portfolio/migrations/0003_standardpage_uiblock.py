from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0002_add_slugs'),
    ]

    operations = [
        migrations.CreateModel(
            name='StandardPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=150, unique=True)),
                ('title', models.CharField(max_length=255)),
                ('title_ru', models.CharField(blank=True, max_length=255, null=True)),
                ('title_en', models.CharField(blank=True, max_length=255, null=True)),
                ('content', models.TextField()),
                ('content_ru', models.TextField(blank=True, null=True)),
                ('content_en', models.TextField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Standard Page',
                'verbose_name_plural': 'Standard Pages',
                'ordering': ['slug'],
            },
        ),
        migrations.CreateModel(
            name='UIBlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.CharField(db_index=True, max_length=100)),
                ('key', models.CharField(max_length=150)),
                ('description', models.CharField(blank=True, help_text='Where this block is used', max_length=255)),
                ('content', models.TextField()),
                ('content_ru', models.TextField(blank=True, null=True)),
                ('content_en', models.TextField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'UI Block',
                'verbose_name_plural': 'UI Blocks',
                'ordering': ['section', 'key'],
                'unique_together': {('section', 'key')},
            },
        ),
    ]


