# Swamp Study Server

## Hosting for Development

To host the Fastify backend for development, you first have to install the
`npm` dependencies as below:

```bash
npm install
```

Next, simply use the `dev` script which includes auto reloading with `nodemon`

```bash
npm run dev
```

## Setting up PostgreSQL

### Installing PostgreSQL and Extensions

To set up the database, first install the PostgreSQL package:

```bash
sudo apt install postgresql
```

**Note:** `apt` is the Debian package manager used as example, you must use
your system's appropriate package manager (e.g. `brew` for MacOS, also omit the
`sudo` for MacOS).

### Creating SwampStudy Database

You then must start the `postgresql` service. For systemd users, run the
command:

```bash
sudo systemctl start postgresql
```

At this point, create a Postgres user to be the owner of the database
(details differ per Postgres distribution).

Next, open `psql` as the `postgres` superuser.

```bash
psql -U postgres
```

You can then create the database owned by your Postgres user.

```sql
CREATE DATABASE swampstudy OWNER <your-user>;
```

### Bootstrapping Database Schema

You can then bootstrap the database schema as your postgres user. First, create
a new `psql` shell in the database with

```bash
psql -U <your-user> -d swampstudy
```

Next, bootstrap the database by executing the `schema.sql` file.

```sql
\ir ./server/src/db/schema.sql
```

## Configuring Server

### PostgreSQL server config

In the server directory, create a copy of `.env.example` called `.env` (do not
delete `.env.example`). Next, fill in your Postgres credentials and change any
other variables if applicable. For email verification in development, you will
need to set the `SENDGRID_API_KEY` variable with your personal API key as well
as `EMAIL_FROM` (configured through SendGrid) and `BASE_URL` for email
formatting.

**Warning:** This file contains secrets and should NEVER be shared. Ensure that
it is in your `.gitignore` before pushing to any public repositories or
sharing.

**Note:** This configuration is not necessary for testing with `npm run test`.

## PostgreSQL Docker Setup

To initialize the database schema in docker, run the following commands to copy
the schema into the docker container and run it:

```bash
docker cp ./server/src/db/schema.sql <postgres-container-name>:/tmp/schema.sql
docker exec -it <postgres-container-name> \
    psql -U <your-user> -d swampstudy -f /tmp/schema.sql
```

Next, create a copy of `.db.env.example` called `.db.env` in the root directory
(do not delete `.db.env.example`). Fill in the same Postgres credentials you
used in your `server/.env` file.
