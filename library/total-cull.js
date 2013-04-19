var fs = require( 'fs' );

var dataByType = {
  'types': [],
  'topsheet': {}
};
var dates = {
  'years': [],
  'yearsAndMonths': {}
};

var callback = function( error, data ) {
  if( !error ) {

    // prepare to iterate over the jsonified data.
    var jsonifiedData = JSON.parse( data );
    var len = jsonifiedData.length;
    var wrong = 0;
    var right = 0;
    var biggest = 0;
    var item; // general variables
    var type, bigEnough, typeData; // type variables
    var rawDate, year, month; // date variables

    // iterate for dates...
    for( var i = 0; i < len; i++ ) {
      item = jsonifiedData[i];

      // determine the date, but only care about month and year
      rawDate = new Date( item['Date'] );
      year = rawDate.getFullYear();

      // if we've never encountered this year before...
      if( !dates['yearsAndMonths'][year] ) {
        dates['yearsAndMonths'][year] = [];
        for( var j = 0; j < 12; j++ ) {
          dates['yearsAndMonths'][year].push( [] );
        }
      }
    }


    // iterate for realz!
    for( var i = 0; i < len; i++ ) {
      item = jsonifiedData[i];
      type = item['Type'];
      typeData = dataByType[type];

      // determine the date, but only care about month and year.
      rawDate = new Date( item['Date'] );
      year = rawDate.getFullYear();
      month = rawDate.getMonth();

      // Determine if the amount is 'big enough'
      if( item['Amount'] >= 500000000 ) {
        bigEnough = true;
        if( item['Amount'] > biggest ) {
          biggest = item['Amount'];
        }
      } else {
        bigEnough = false;
      }

      // if we've never encountered this Type before...
      if( !typeData ) {
        dataByType[type] = {
          'numberOfItems': 0,
          'numberOfBigItems': 0,
          'numberOfSmallItems': 0,
          'bigTotal': 0,
          'smallTotal': 0,
          'total': 0,
          'big': dates['yearsAndMonths'],
          'small': dates['yearsAndMonths']
        }
        dataByType['types'].push( type );
        typeData = dataByType[type];
      }

      // now that we've made sure the item's Type has an entry...
      typeData['numberOfItems'] += 1; // incriment the total number of items for the given type
      typeData['total'] += item['Amount']; // incriment the amount of dollars for the given type 

      // if this item is big enough...
      if( bigEnough ) {
        typeData['big'][year][month].push( item ); // push the item
        typeData['bigTotal'] += item['Amount'] // incriment the big amount
        typeData['numberOfBigItems'] += 1 // incriment the number of big items

      // if this item is _not_ big enough...
      } else {
        //typeData['small'][year][month].push( item ); // push the item
        typeData['smallTotal'] += item['Amount'] // incriment the small amount
        typeData['numberOfSmallItems'] += 1; // incriment the number of small items
      }
    }

    // create the topsheet info
    var type, typeData;
    for( var i = 0; i < dataByType['types'].length; i++ ) {
      type = dataByType['types'][i];
      typeData = dataByType[type];
      dataByType['topsheet']['meta'] = {
        'biggest': biggest
      };
      dataByType['topsheet'][type] = {
        'numberOfItems': typeData['numberOfItems'],
        'numberOfBigItems': typeData['numberOfBigItems'],
        'numberOfSmallItems': typeData['numberOfSmallItems'],
        'bigTotal': typeData['bigTotal'],
        'smallTotal': typeData['smallTotal'],
        'total': typeData['total']
      }
    }

    // write the file
    fs.writeFile(
      'data/full-sorted.js',
      JSON.stringify( dataByType, null, 2 ),
      function( error ) {
        if( error ) { console.log( error ); }
        else { console.log( 'written!' ); }
      }
    )


  } else { console.log( error ); }
}

fs.readFile( 'data/full.js', callback );