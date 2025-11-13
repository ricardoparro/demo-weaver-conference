#!/bin/bash
cd "$(dirname "$0")"
rm -f notebook.db
node server.js > /tmp/startup.log 2>&1 &
SERVER_PID=$!
sleep 3

echo "Initial Seed Data Verification:"
echo "================================"
NOTEBOOKS=$(curl -s http://localhost:3000/api/notebooks | grep -o '"id":' | wc -l | xargs)
NOTES=$(curl -s http://localhost:3000/api/notes | grep -o '"id":' | wc -l | xargs)
FAVORITES=$(curl -s http://localhost:3000/api/favorites | grep -o '"id":' | wc -l | xargs)
TAGS=$(curl -s http://localhost:3000/api/tags | grep -o '"id":' | wc -l | xargs)

echo "✓ Notebooks: $NOTEBOOKS"
echo "✓ Notes: $NOTES"
echo "✓ Favorites: $FAVORITES"
echo "✓ Tags: $TAGS"

kill $SERVER_PID
