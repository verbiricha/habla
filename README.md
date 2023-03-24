# habla

A web client to read/write [long form nostr content](https://github.com/nostr-protocol/nips/blob/master/23.md).

Available in https://habla.news.

## Contribute

To run Habla locally for development,

* install node, git, yarn
* clone Habla
* run:
  ```
  yarn install
  yarn start
  ```

This should start a local server and open a browser with the project. You can
now start modifying the code and see the changes in real time.

## Run your own instance

```
yarn install
yarn build
rsync --recursive --delete /path/to/habla/build/ your.server:/your/path/on/server/
```

You will need a domain or subdomain for this as file references in the code
are absolute paths, currently not allowing it to run Habla under
`https://yourserver.com/habla/` for example.
