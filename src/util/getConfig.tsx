/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import config from "../../config.json";

interface Config {
    baseUrl: string;
    clientID: string;
    scope: string[];
    signInRedirectURL: string;
    signOutRedirectURL: string;
    myAccountAppURL: string;
    resourceServerURL: string;
  }

declare global {
    interface Window {
      config: Config;
    }
}  

const authConfig = {
    baseUrl: config.baseUrl,
    clientID: config.clientID,
    signInRedirectURL: config.signInRedirectURL,
    signOutRedirectURL: config.signOutRedirectURL,
    myAccountAppURL: config.myAccountAppURL,
    resourceServerURL: config.resourceServerURL,
    scope: ["openid", "profile", "email"],
  };

export function getConfig() {
    return authConfig;
}


