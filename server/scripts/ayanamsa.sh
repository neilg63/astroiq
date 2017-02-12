DATE="-b"$1
TIME="-ut"$2 

OUT=$(swetest $DATE $TIME -ay0 | grep 'Ayanamsa')
echo "ay-0: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay1 | grep 'Ayanamsa')
echo "ay-1: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay2 | grep 'Ayanamsa')
echo "ay-2: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay3 | grep 'Ayanamsa')
echo "ay-3: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay4 | grep 'Ayanamsa')
echo "ay-4: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay5 | grep 'Ayanamsa')
echo "ay-5: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay6 | grep 'Ayanamsa')
echo "ay-6: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay7 | grep 'Ayanamsa')
echo "ay-7: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay8 | grep 'Ayanamsa')
echo "ay-8: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay9 | grep 'Ayanamsa')
echo "ay-9: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay10 | grep 'Ayanamsa')
echo "ay-10: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay15 | grep 'Ayanamsa')
echo "ay-15: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay16 | grep 'Ayanamsa')
echo "ay-16: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay21 | grep 'Ayanamsa')
echo "ay-21: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay22 | grep 'Ayanamsa')
echo "ay-22: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay23 | grep 'Ayanamsa')
echo "ay-23: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay25 | grep 'Ayanamsa')
echo "ay-25: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay26 | grep 'Ayanamsa')
echo "ay-26: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay27 | grep 'Ayanamsa')
echo "ay-27: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay28 | grep 'Ayanamsa')
echo "ay-28: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay29 | grep 'Ayanamsa')
echo "ay-29: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay30 | grep 'Ayanamsa')
echo "ay-30: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'

OUT=$(swetest $DATE $TIME -ay35 | grep 'Ayanamsa')
echo "ay-35: " $OUT | sed -e "s/Ayanamsa\s*//g" | sed -r 's/([0-9][^0-9 ])\s?\s?([0-9][^0-9 ])\s?\s?([0-9])/\1\2\3/'
