# What is CARTO GL

CARTO VL is a JavaScript library that interacts with different CARTO APIs to build custom apps leveraging vector rendering.

Based on webgl, CARTO VL allows you to do things never seen before in a very simple way and since the rendering occurs in the client the applications feel fast and fluid.

CARTO VL is part of the [CARTO ecosystem](https://carto.com/developers/) to create Location Intelligence applications.

Unlike the traditional applications where the map is formed from images generated on the server (raster) CARTO VL downloads the data in a vector format to eventually generate the images at the client.

If we want to change the color of a point using raster tecnology we have to send the new styles to the server and download all the images again while with CARTO VL the data is downloaded
only once and it is the client who decides its visualization, giving rise to infinite possibilities in an instantaneous way: "paint the capitals of green and the villages red, make the size of the point depend on the population, change the color when the mouse passes above, animations ... "

To control all this, a new visualization definition language `MVML` (map visualization meta-language) has been designed. This allows to define in a simple way how we want our application to behave.

Location intelligence means much more than maps so CARTO VL allows us to access geospatial data in a simple way being able to create widgets to understand our data in a deeper way.

# What can be done with CARTO GL

CARTO GL is the perfect library to create the location intelligence apps of the future, among its main features:

- It allows to download and use vector data from the CARTO APIs
- It allows to paint maps in client using webgl technologies
- Enrich your maps with dynamic styles, animations and interactivity
- Create widgets and elements to show geospatial data in different ways
