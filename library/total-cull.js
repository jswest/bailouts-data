var fs = require( 'fs' );

var sortedData = {
  'types': [],
  'topsheet': {},
  'years': [],
  'yearsAndMonths': {}
};

var dataByDate = {};

var callback = function( error, data ) {
  if( !error ) {

    // prepare to iterate over the jsonified data.
    var jsonifiedData = JSON.parse( data );
    var len = jsonifiedData.length;
    var item; // general variables
    var type, bigEnough, typeData; // type variables
    var rawDate, year, month; // date variables

    // iterate for dates...
    for( var i = 0; i < len; i++ ) {
      item = jsonifiedData[i];

      // determine the date, but only care about month and year
      rawDate = new Date( item['Date'] );
      year = rawDate.getFullYear();
      month = rawDate.getMonth();

      // if we've never encountered this year before...
      if( !sortedData['yearsAndMonths'][year] ) {
        sortedData['years'].push( year );
        sortedData['yearsAndMonths'][year] = [];
        dataByDate[year] = [];
        for( var j = 0; j < 12; j++ ) {
          sortedData['yearsAndMonths'][year].push( [] );
          dataByDate[year].push( [] );
        }
      }

      // now, push the data into the dataByDate variable
      dataByDate[year][month].push( item );
    }


    // iterate for realz!
    var j, k, pYear;
    for( var i = 0; i < len; i++ ) {
      item = jsonifiedData[i];
      type = item['Type'];

      // determine the date, but only care about month and year.
      rawDate = new Date( item['Date'] );
      year = rawDate.getFullYear();
      month = rawDate.getMonth();

      // Determine if the amount is 'big enough'
      if( item['Amount'] >= 500000000 ) {
        bigEnough = true;
      } else {
        bigEnough = false;
      }

      // if we've never encountered this Type before...
      if( !sortedData[type] ) {
        sortedData[type] = {
          'numberOfItems': 0,
          'numberOfBigItems': 0,
          'numberOfSmallItems': 0,
          'bigTotal': 0,
          'smallTotal': 0,
          'total': 0,
          'big': {},
          'small': {}
        }
        for( j = 0; j < sortedData['years'].length; j++ ) {
          pYear = sortedData['years'][j];
          sortedData[type]['big'][pYear] = [];
          for( k = 0; k < 12; k++ ) {
            sortedData[type]['big'][pYear].push( [] );
          }
          sortedData[type]['small'][pYear] = [];
          for( k = 0; k < 12; k++ ) {
            sortedData[type]['small'][pYear].push( [] );
          }
        }
        sortedData['types'].push( type );
      }

      typeData = sortedData[type];

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
    
    // great. now find the "whitespace" months from the top and bottom
    // also find the biggest month
    var firstYear = sortedData['years'][0]; // top
    var lastYear = sortedData['years'][sortedData['years'].length - 1]; // bottom
    var firstMonth, lastMonth;

    // iterate over the first year...
    var month;
    for( var i = 0; i < dataByDate[firstYear].length; i++ ) {
      month = dataByDate[firstYear][i];
      if( month.length > 0 ) {
        firstMonth = i;
        break;
      }
    }

    // iterate over the last year...
    var month;
    for( var i = dataByDate[lastYear].length - 1; i >= 0; i-- ) {
      month = dataByDate[lastYear][i];
      if( month.length > 0 ) {
        lastMonth = i;
        break;
      }
    }

    // find the biggest month
    var year, month, amountInMonth;
    var j, k;
    var amountOfBiggestMonth = 0;
    for( var i = 0; i < sortedData['years'].length; i++ ) {
      year = sortedData['years'][i];
      for( j = 0; j < 12; j++ ) {
        month = dataByDate[year][j];
        amountInMonth = 0;
        for( k = 0; k < month.length; k++ ) {
          amountInMonth += month[k]['Amount'];
        }
        if( amountInMonth > amountOfBiggestMonth ) {
          amountOfBiggestMonth = amountInMonth;
        }
      }
    }

    // create the topsheet info
    var type, typeData;
    for( var i = 0; i < sortedData['types'].length; i++ ) {
      type = sortedData['types'][i];
      typeData = sortedData[type];
      sortedData['topsheet']['meta'] = {
        'amountOfBiggestMonth': amountOfBiggestMonth,
        'numberOfYears': sortedData['years'].length,
        'numberOfMonths': sortedData['years'].length * 12
      };
      sortedData['topsheet'][type] = {
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
      JSON.stringify( sortedData, null, 2 ),
      function( error ) {
        if( error ) { console.log( error ); }
        else { console.log( 'written!' ); }
      }
    )


  } else { console.log( error ); }
}

fs.readFile( 'data/full.js', callback );