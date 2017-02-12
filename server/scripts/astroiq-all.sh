DIR="$( cd "$( dirname "$0" )" && pwd )"
$DIR/combined.sh $1 $2 $4 $3 $5 | sed -r 's/^([tg]\.)?swetest.*?$//g' | awk 'NF' | sed -r 's/:\s+/:/g' | sed -r 's/([a-z0-9_.-])\s\s*(-?[0-9])/\1,\2/g'
