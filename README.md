# Liftians Workstation UI

This project is a combination of React and Electron.

## Install Instructions
### Install NodeJS
https://nodejs.org/en/download/

**Prefer version: v10 or higher**

### Install Yarn
https://yarnpkg.com/lang/en/docs/install/#windows-stable

### Clone project from Github
Enter project directory and install packages with `yarn install`

## .env File:
Under directory there will be a `.env` file for setting environement parameter

**NOTE:** The variable need to start with `REACT_APP` in order to be used in React Application.

| Variable Name  | Description  |
|---|---|
| REACT_APP_VERSION   | App Version. Please be in synce with package.json's version   |
| REACT_APP_ENV  | Options: `PRODUCTION` and `DEV`. Dev env will display debugger tool on load. |
| REACT_APP_LOCALE  | Options: `ENG` and `CHN`. This will determine which field to use for displaying order detail.  |
| REACT_APP_BOX_AMOUNT  | Box amount for the station |
| REACT_APP_BUSINESS_MODE  | Options: `ecommerce` and `pharmacy`. Different business model. Please refer to Shujane the difference.  |
| REACT_APP_IMAGE_BASE_URL  | Product image url |
| REACT_APP_TABLE_DATE_FORMAT  | Date format used in order list  |
| REACT_APP_TABLE_DATE_FORMAT_NO_SEC  | Same as aboe, just no second |
| REACT_APP_PICKING_IDLE_TIME  | Idel time for picking |

## WMS API Key
If you want to use the data generate feature. Create a `apiKey.json` file under `src` directory.

```json
{
  "key": "c9Dof3-CC0De-Ev9ap",
  "secret": "2ewo9-edoe0-De8eV-y2CGB3"
}
```

## Proxy
In dev environment, remember to change proxy setting in `package.json`. While logging in use `http://localhost` for url and `3000` for port.

You don't need to worry about proxy after build.


## Starting Dev server:
Both web and desktop build are using the same code base. 

- Just browser: `yarn react-start`

**NOTE:** If your browser page after the commend, please check the debugger tool console. If there is an error message about `require is not defined`. Try to install `sockjs-client` by execute  `yarn add sockjs-client@1.1.5`

- Both browser and Electron: `yarn start`

## Build
- Web version build:
`yarn build-web`

The build will be under `/build` under project directory.
Open `index.html` file to run the application. 

*NOTE:* Always remember to clean cache. 

*NOTE:* Always remember to clean cache. 

- Desktop version build:
`yarn electron-pack`

This will generate a `dist` folder under project directory. Inside the folder there will have `.exe` file for Windows and `.dmg` file for Mac to install.

## Debug
- Web:
Right click in browser and select `Inspect`. You will be able to see 

- Desktop:
In the window menu bar click on `View` and click `Toggle Developer Tools`. (Shortcut: `Ctrl+Shift+I`)
Enter `599seaport` for password to open debugger console.
