assembly:
	sbt app/assembly

docker:
	sbt app/docker

clean:
	sbt clean

format:
	sbt scalafmt test:scalafmt scalafmtSbt 

style:
	sbt scalastyle test:scalastyle

test:
	sbt test

test-all: clean format style test 
	sbt unidoc

publish-local:
	sbt publishLocal

run:
	sbt app/run

update-openapi:
	sbt "tools/runMain org.alephium.tools.OpenApiUpdate"

benchmark-run:
	sbt "benchmark/jmh:run"
	
create-db:
	# Env variables as defined in `application.conf`
	mysql \
		-h $(or $(DB_HOST), localhost) \
		-P $(or $(DB_PORT), 3306) \
		-u $(or $(DB_USER), root) \
		-p$(or $(DB_PASSWORD), password) \
		-e "CREATE DATABASE IF NOT EXISTS $(or $(DB_NAME), explorer);"


restore-db:
	#Make sure to define ALEPHIUM_NETWORK to "mainnet" or "testnet"
	curl $(shell curl -L -s "https://s3.eu-central-1.amazonaws.com/archives.alephium.org/archives/${ALEPHIUM_NETWORK}/explorer-db/_latest.txt") -L ${url} | \
	gunzip -c | \
	mysql \
		-h $(or $(DB_HOST), localhost) \
		-P $(or $(DB_PORT), 3306) \
		-u $(or $(DB_USER), root) \
		-p$(or $(DB_PASSWORD), password) \
		-D $(or $(DB_NAME), explorer)

