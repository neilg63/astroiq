DATE="-b"$1
TIME="-ut"$2

HOUSE="-house"$4","$3",W"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/W-\1: /g'

HOUSE="-house"$4","$3",E"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/E-\1: /g'

HOUSE="-house"$4","$3",D"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/D-\1: /g'

HOUSE="-house"$4","$3",CB"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/CB-\1: /g'

HOUSE="-house"$4","$3",S"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/S-\1: /g'

HOUSE="-house"$4","$3",O"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/O-\1: /g'

HOUSE="-house"$4","$3",P"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/P-\1: /g'

HOUSE="-house"$4","$3",K"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/K-\1: /g'

HOUSE="-house"$4","$3",B"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/B-\1: /g'

HOUSE="-house"$4","$3",C"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/C-\1: /g'

HOUSE="-house"$4","$3",M"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/M-\1: /g'

HOUSE="-house"$4","$3",R"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/R-\1: /g'

HOUSE="-house"$4","$3",T"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/T-\1: /g'

HOUSE="-house"$4","$3",A"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/A-\1: /g'

HOUSE="-house"$4","$3",X"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/X-\1: /g'

HOUSE="-house"$4","$3",G"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/G-\1: /g'

HOUSE="-house"$4","$3",H"
swetest $DATE $TIME $HOUSE -p | grep 'house' | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/' | sed -r 's/house\s\s?\s?([0-9]+)\s+/H-\1: /g'
