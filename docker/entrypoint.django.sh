#!/bin/sh
set -e

python campus/manage.py migrate --noinput

# Static collection is best-effort for this API-first deployment.
if ! python campus/manage.py collectstatic --noinput --clear; then
	echo "[warn] collectstatic failed; continuing container startup"
fi

exec "$@"
