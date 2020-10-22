/* eslint-disable indent */
/* eslint-disable no-unused-expressions */
const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { decideFolder, copyValue } = require('../src/utils/file')
const baseConfig = require('../src/config')
const resolve = file => path.resolve(__dirname, file)
if (fs.existsSync(resolve('../project.config.js'))) {
  const projectConfig = require('../project.config.js')
  copyValue(projectConfig, baseConfig)
}

const { name, nginx } = baseConfig
const { road, sbin, ssl_path } = nginx

const proPath = path.resolve(__dirname, '../')
const configPath = path.resolve(__dirname, `${name}.conf`)
const nginxPath = path.join(road, `${name}.conf`)

const nginxConfigGenerate = deploy => {
  return `
server{
  ${
    deploy.server_name
      ? `listen 80;listen 443 ssl;
  ssl_certificate ${path.join(ssl_path, deploy.cat)};
  ssl_certificate_key ${path.join(ssl_path, deploy.key)};
  server_name ${deploy.server_name};`
      : `listen ${deploy.NGPOST};`
  }

  charset utf-8;
  location /{
    try_files $uri $uri/ /index.html;
    root  ${path.join(proPath, 'dist/build/h5')};
    index  ${path.join(proPath, 'dist/build/h5')}${path.sep}index.html;
  }
}`
}

const nginxConfig = `
#新零售视频
${nginxConfigGenerate(nginx)}
`

decideFolder(road)

fs.writeFileSync(configPath, nginxConfig, 'utf8')

!(async () => {
  await exec(`sudo mv ${configPath} ${nginxPath}`)
  const { stdout, stderr } = await exec(
    `ps -ef | grep nginx | grep -v '.js' | grep -v grep | wc -l`
  )
  if (stderr) return
  if (Number(stdout) > 0) await exec(`sudo ${sbin} -s reload`)
  else await exec(`sudo ${sbin}`)
})()
