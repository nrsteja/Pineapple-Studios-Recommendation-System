# test api route:

the route is:

```
/test/api/{id}
/test/print/{id}
```

and there are two backup routes if id is not applied:

```
/test/api
/test/print
```

these two endpoint will always return the same error message.

to use these api routes:

1. start the dev server first

```shell
npm run dev
```

2. in another terminal tab

```shell
curl http://localhost:3000/test/api/{id}
curl http://localhost:3000/test/print/{id}
```

3. for the `api` route: it will return a json, and print in the terminal
   directly
4. for the `print` route: a `object` will print in the dev server's console.

To test different functions:
the example function is `src/lib/database/functions.ts`, and it is
called `getItemInfo(id: string)`. you can change it with the function you want
to test.

By the way, do not write the database function directly under
the `app/route/test.*` files, ie. in those files: `const data = getItemInfo(id)`
only change the `getItemInfo` function and write the function
under `lib/database`.

you do not need to submit the changes of the `route.test.*`, you may ignore
them

```shell
# Ignore checked in file:

git update-index --assume-unchanged file_path


# To revert
git update-index --no-assume-unchanged file_path

# Revert All
git update-index --really-refresh
```
