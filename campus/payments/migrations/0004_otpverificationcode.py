from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0003_fraudfeedbackrecord_riskalert_systemnotification_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="OTPVerificationCode",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("phone_number", models.CharField(db_index=True, max_length=32)),
                ("otp_code", models.CharField(max_length=6)),
                (
                    "purpose",
                    models.CharField(
                        choices=[("user", "User"), ("admin", "Admin")],
                        db_index=True,
                        default="user",
                        max_length=10,
                    ),
                ),
                ("is_used", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField(db_index=True)),
            ],
            options={
                "indexes": [
                    models.Index(
                        fields=["phone_number", "purpose", "is_used", "expires_at"],
                        name="payments_ot_phone_n_7ce52f_idx",
                    )
                ]
            },
        ),
    ]
