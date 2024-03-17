#!/bin/bash
git stash;
git pull origin main;
pm2 stop gameServer;
pm2 delete gameServer;
npm install;
npm run pm2;