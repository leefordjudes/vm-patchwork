import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class Patch5Service {
  constructor(){}
  async printConfig(data: any, query: any) {
    const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = query;
    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
    //const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?authSource=admin`;
    try {
      const connection = await new MongoClient(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      if (data.AT006) {
        const sale = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT006' },
            { $set: { config: data.AT006 } },
          );
        console.log('sale print patched');
      }

      if (data.AT008) {
        const stockTransfer = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT008' },
            { $set: { config: data.AT008 } },
          );
      }

      if (data.AT009) {
        const saleReturn = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT009' },
            { $set: { config: data.AT009 } },
          );
      }

      if (data.AT010) {
        const custom = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT010' },
            { $set: { config: data.AT010 } },
          );
      }
      
      if (data.AT011) {
        const crSale = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT011' },
            { $set: { config: data.AT011 } },
          );
      }

      if (data.AT012) {
        const custom = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT012' },
            { $set: { config: data.AT012 } },
          );
      }

      if (data.AT013) {
        const custom = await connection.db().collection('printtemplates')
          .updateMany(
            { code: 'AT013' },
            { $set: { config: data.AT013 } },
          );
      }
     console.log('Print config done');
    //  console.log('------Drop Collections----');
    //  await connection.db().dropCollection('defaultprinttemplates');
      // const branch =  connection.db().collection('branches').updateMany({}, {$set: {'otherInfo.licenseNo': '$addressInfo.city'}});
      // console.log(branch);

      await connection.close();
      return true;
    } catch (err) {
      return false;
    }
  }
}
