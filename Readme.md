# dropserver_app

`dropserver_app` is a library that helps you create [Dropserver](https://dropserver.org) applications.

Import `createApp` to get going:

```TS
import {createApp} from 'https://deno.land/x/dropserver_app/mod.ts';

const app = createApp({
	routes:     // your app routes... see docs.
	migrations: // data migrations. Optional. See docs.
});

export default app;
```

Docs and help:

- Docs for this library are available at [deno.land/x/dropserver_app](https://deno.land/x/dropserver_app/)
- A tutorial for building a Dropserver app using this lib is at [dropserver.org/docs/build-dropserver-app-tutorial](https://dropserver.org/docs/build-dropserver-app-tutorial/)

# License

MIT