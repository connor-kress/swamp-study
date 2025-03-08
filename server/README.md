# Swamp Study Server

## Hosting for Development

To host the Fastify backend for development, you first have to install the
`npm` dependencies as below:

```bash
$ npm install
```

Next, simply use the `dev` script which includes auto reloading with `nodemon`

```bash
$ npm run dev
```

## Setting up PostgreSQL

### Installing PostgreSQL and Extensions

To set up the database, first install the PostgreSQL package:

```bash
$ sudo apt install postgresql
```

**Note:** `apt` is the Debian package manager used as example, you must use
your system's appropriate package manager (e.g. `brew` for MacOS, also omit the
`sudo` for MacOS).

### Creating SwampStudy Database

You then must start the `postgresql` service. For systemd users, run the
command:

```bash
$ sudo systemctl start postgresql
```

At this point, create a Postgres user to be the owner of the database
(details differ per Postgres distribution).

Next, open `psql` as the `postgres` superuser.

```bash
$ psql -U postgres
```

You can then create the database owned by your Postgres user.

```sql
CREATE DATABASE swampstudy OWNER <your-user>;
```

### Bootstrapping Database Schema

You can then bootstrap the database schema as your postgres user. First, create
a new `psql` shell in the database with

```bash
$ psql -U <your-user> -d swampstudy
```

Next, bootstrap the database by executing the `schema.sql` file.

```sql
\ir ./server/db/schema.sql
```
