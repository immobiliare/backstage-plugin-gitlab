# Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat(scope): some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### yarn scripts

```bash
# install dependencies
$ yarn
# run tests
$ yarn test
# run the code linter
$ yarn lint
# Build the lib
$ yarn build
# Test UI locally with mocked data
$ yarn start
```

### Commit Convention

This projects uses [commitlint](https://commitlint.js.org/) with Angular configuration so be sure to use standard commit format or PR won't be accepted

### Quality

Contributions should be validated with the command:

```bash
$ codeclimate analyze
```

See [codeclimate](https://github.com/codeclimate/codeclimate).

### Test

Contributions should pass existing tests or have test cases for new functionality.

```bash
# Should pass
$ yarn test
```

### Style

Style and lint errors should be fixed with

```bash
$ yarn lint
```

## Contributors

[@JellyBellyDev](https://github.com/JellyBellyDev)
[@simonecorsi](https://github.com/simonecorsi)
[@dnlup](https://github.com/dnlup)
[@antoniomuso](https://github.com/antoniomuso)
[@sergeyshevch](https://github.com/sergeyshevch)
