(Correction!)
You could do what is listed below, but it seems much simpler to do this:
$ svn rm --keep-local node_modules/everyauth/node_modules/connect/node_modules/debug

This will remove the directory from the repository AND keep the files around

(Old way)
This is how you remove the "tmp" directory from subversion control.  Note:  You need to copy the contents of "tmp" somewhere and then copy it back after done as "svn rm * --force" will delete the files.

$ cd /path/to/app/tmp
$ svn st
M slkdjfag.jpg
M gasgsag.png
. #bunch of M's

$ svn rm * --force
$ svn ci -m'trunk: cleaning up tmp directory'
$ svn propset svn:ignore '*' .
$ touch a
$ svn st // shouldn't output anything

Got this from: http://stackoverflow.com/questions/6882020/svn-how-to-ignore-folder-without-removing-it-from-my-repository
