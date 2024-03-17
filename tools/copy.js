const shell = require('shelljs');

// Copy all the view templates
shell.cp( '-R', 'src/assets', 'dist/' );
shell.cp( '-R', 'src/email-service/templates', 'dist/email-service/' );
