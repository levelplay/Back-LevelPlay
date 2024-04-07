#!/bin/bash
git stash;
git pull origin main;
pm2 delete gameS;
npm install;
npm run pm2;
cd ../level-play