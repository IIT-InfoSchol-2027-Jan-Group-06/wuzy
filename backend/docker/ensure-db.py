"""Create the app database if it does not exist yet.

Postgres only honors POSTGRES_DB on a fresh data directory. A leftover volume
skips initialization entirely, so connect to the maintenance database and
create the app database explicitly before migrations run.
"""

import os
import sys

import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

URL = os.environ["DATABASE_URL"].replace("+psycopg2", "")
DB_NAME = URL.split("/")[-1]
ADMIN_URL = URL.rsplit("/", 1)[0] + "/postgres"

conn = psycopg2.connect(ADMIN_URL)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
with conn.cursor() as cursor:
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    if cursor.fetchone() is None:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
        print(f"Created database {DB_NAME}")
    else:
        print(f"Database {DB_NAME} already exists")
conn.close()
sys.exit(0)
