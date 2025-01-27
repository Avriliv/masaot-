# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Setting up Local OSRM Server

To use local routing for hiking trails, you'll need to set up a local OSRM server:

1. Install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. Download the latest Israel OSM data:
```bash
mkdir osrm-data
cd osrm-data
curl -o israel-and-palestine-latest.osm.pbf https://download.geofabrik.de/asia/israel-and-palestine-latest.osm.pbf
```

3. Run the OSRM Docker container:
```bash
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/foot.lua /data/israel-and-palestine-latest.osm.pbf
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/israel-and-palestine-latest.osrm
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/israel-and-palestine-latest.osrm
```

4. Start the routing server:
```bash
docker run -t -i -p 5000:5000 -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/israel-and-palestine-latest.osrm
```

The server will be available at `http://localhost:5000`. The application will automatically use it when available.

## Credits and Licenses

This project uses several open-source components:

### Map Data and Services
- **OpenStreetMap**: Map data  OpenStreetMap contributors, available under the [Open Database License (ODbL)](https://www.openstreetmap.org/copyright)
- **Israel Hiking Map**: Map style and routing services provided by [Israel Hiking Map](https://israelhiking.osm.org.il)

### Software Components
- **OSRM**: Routing engine available under the [BSD 2-Clause License](https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT)
- **React**: UI framework available under the [MIT License](https://github.com/facebook/react/blob/main/LICENSE)
- **Leaflet**: Mapping library available under the [BSD 2-Clause License](https://github.com/Leaflet/Leaflet/blob/main/LICENSE)

Per the requirements of these licenses, any modifications or improvements to the map data should be shared back with the OpenStreetMap community.
