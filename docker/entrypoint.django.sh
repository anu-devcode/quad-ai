#!/bin/sh
set -e

python campus/manage.py migrate --noinput
python campus/manage.py runserver 0.0.0.0:8000
