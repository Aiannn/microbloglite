git clone https://github.com/craigmckeachie/microbloglite
cd microbloglite/microbloglite-backend
npm install
cp .env.example .env
cd ..
pwd
rm -rf .git
git config --global init.defaultBranch main
git init
git add .
git commit -m 'initial commit'
