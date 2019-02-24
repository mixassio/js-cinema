start:
	DEBUG=app npx nodemon --watch .  --ext '.js' --exec npx gulp server

lint:
	npm run eslint .

publish:
	npm publish

test:
	npm test
