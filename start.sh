PRG="$0"
while [ -h "$PRG" ]; do
  ls=`ls -ld "$PRG"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "$PRG"`/"$link"
  fi
done
# Get standard environment variables
PRGDIR=`dirname "$PRG"`
# Only set CATALINA_HOME if not already set
[ -z "$SOLR_HOME" ] && SOLR_HOME=`cd "$PRGDIR/solr" >/dev/null; pwd`
export JAVA_OPTS="$JAVA_OPTS -Dsolr.data.dir=$SOLR_HOME"
echo "Using SOLR_HOME:   $SOLR_HOME"
./bin/catalina.sh run
