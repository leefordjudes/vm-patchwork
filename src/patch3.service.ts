import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import * as iface from './model/interfaces';
import { PRIVILEGE } from './fixtures/privilege/privilege';
import { existsPrivileges } from './fixtures/privilege/privilege.exists';

@Injectable()
export class Patch3Service {
  constructor(
    @InjectModel('Role') private readonly roleModel: Model<iface.Role>,
  ) {}

  async updateRolePrivileges() {
    const roles = await this.roleModel.find({ validateName: { $ne: 'admin' } });
    const updateRoleObj = [];
    const adminRoleUpdateObj = {
      updateOne: {
        filter: { validateName: 'admin' },
        update: {
          $set: {
            privileges: '{}',
          },
        },
      },
    };
    console.log('Role count: ' + roles.length);
    updateRoleObj.push(adminRoleUpdateObj);
    console.log('admin role patch - added');
    for (const role of roles) {
      console.log('Role name: ' + role.name);
      const rolePrivileges: any = role.privileges.filter(p => p.value === true);
      console.log('Privileges count: ' + rolePrivileges.length);
      const privilegeObj = _.cloneDeep(PRIVILEGE);
      for (const rolePrivilege of rolePrivileges) {
        const code = rolePrivilege.code;
        // console.log(role.name, code);
        const path = existsPrivileges.find(p => p.code === code).path;
        // console.log(role.name, path);
        // const value = _.get(privilegeObj, `${path}.value`);
        _.set(privilegeObj, `${path}.value`, true);
      }
      const updateObj = {
        updateOne: {
          filter: { _id: role._id },
          update: {
            $set: {
              privileges: JSON.stringify(privilegeObj),
            },
          },
        },
      };
      updateRoleObj.push(updateObj);
      console.log(role.name + ' role patch added');
    }
    console.log('Role patch started...');
    const rolePatchResult = await this.roleModel.bulkWrite(updateRoleObj);
    console.log('Role patch end');
    return rolePatchResult;
  }
}
