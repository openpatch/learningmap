.PHONY: setup
setup:
	go mod tidy
	cd ui && pnpm install
.PHONY: build
build:
	pushd ui && pnpm run build && popd
	go build
.PHONY: run
run:
	pushd ui && pnpm run build && popd
	go run main.go serve & cd ui && pnpm run dev && kill $!