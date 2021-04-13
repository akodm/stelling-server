echo "dummy data creator...";
echo "require mysql root path.";
echo "plz mysql info. ex) -u root -p xxxx [database name]";
read var;
if [ "$var" ]; then
  mysql $var < ./dummyCreator.sql
fi
echo "exit.";
exit;