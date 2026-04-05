#!/bin/sh
set -e

python campus/manage.py migrate --noinput
python campus/manage.py collectstatic --noinput --clear

exec "$@"
