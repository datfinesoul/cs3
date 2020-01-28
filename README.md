## Notes

```sh
npm install --dry-run 2>&1 | \
  grep -e 'WARN [^ ]\+ .*requires a peer ' | \
  cut -d' ' -f8 | \
  cut -d'@' -f1 | \
  sort | \
  uniq | \
  xargs -I{} npm i -D {}
```
