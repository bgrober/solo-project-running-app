var Sequelize = require('sequelize');
var Users = require('./user_database.js');

var sequelize = new Sequelize('Run_Users', 'brian', 'runs', {
  host: 'localhost',
  dialect: 'postgres'
});

sequelize.authenticate().then(function(err, data) {
  console.log('Connected with PostgreSQL ORM - Run_Users.activities');
}).catch(function(err) {
  console.log(err);
});

var activities = sequelize.define('activities', {
  activity_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  type: Sequelize.STRING,
  name: Sequelize.STRING,
  distance: Sequelize.FLOAT,
  moving_time: Sequelize.STRING,
  total_elevation_gain: Sequelize.FLOAT,
  start_date: Sequelize.STRING,
  location_city: Sequelize.STRING,
  location_state: Sequelize.STRING,
  location_country: Sequelize.STRING,
  start_latitude: Sequelize.FLOAT,
  start_longitude: Sequelize.FLOAT,
  polyline: Sequelize.TEXT,
  average_speed: Sequelize.FLOAT,
  max_speed: Sequelize.FLOAT,
  average_heartrate: Sequelize.FLOAT,
  max_heartrate: Sequelize.INTEGER
});

Users.userModel.hasMany(activities, {as: 'activities'});
//store last 200 activities in the activities table. If the activity already exists, then do nothing.
var syncActivities = function(data) {
  sequelize.sync().then(function(err){
    // if(err) console.log(err);
    activities.findOne({
      where: {activity_id: data.id, user_id: data.athlete.id}
    })
    .then(function(activity) {
        if(!activity){
          activities.create({
            activity_id: data.id,
            user_id: data.athlete.id,
            type: data.type,
            name: data.name,
            distance: data.distance,
            moving_time: data.moving_time,
            total_elevation_gain: data.total_elevation_gain,
            start_date: data.start_date_local,
            location_city: data.location_city,
            location_state: data.location_state,
            location_country: data.location_country,
            start_latitude: data.start_latitude,
            start_longitude: data.start_longitude,
            polyline: data.map.summary_polyline,
            average_speed: data.average_speed,
            max_speed: data.max_speed,
            average_heartrate: data.average_heartrate,
            max_heartrate: data.max_heartrate
          });
        }
      });
  // updateAverageSpeed(data);
  });
};

//After activities are stored in table, the User table is updated to reflect the average speed of the user.
var updateAverageSpeed = function(data) {
  var avg = 0;
  activities
  .findAndCountAll({
     where: {
        user_id: data.athlete.id,
        type: 'Run'
     },
  })
  .then(function(result) {
    // console.log(result.rows[0].dataValues.average_speed);
    totalCount = result.count;
    totalSpeed = 0;
    result.rows.forEach(function(elem) {
      totalSpeed += elem.dataValues.average_speed;
      // prev.dataValues.average_speed + curr.dataValues.average_speed;
    });
    var averageSpeed = totalSpeed/totalCount;
    Users.userModel.update(
      {average_speed: averageSpeed},
      {where: {user_id: data.athlete.id}}
    )
    .then(function(rows){
      console.log(rows);
    });
  });
};

module.exports = {syncFunction: syncActivities, updateAverage: updateAverageSpeed};
