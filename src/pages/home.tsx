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

import { BasicUserInfo, Hooks, useAuthContext } from "@asgardeo/auth-react";
import { Grid } from '@mui/material';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import LOGO_IMAGE from "../images/agromart-logo-final.png";
import LOGO_THUMBNAIL_IMAGE from "../images/thumbnail.png";
import HOME_PAGE_IMAGE from "../images/background-final.png";
import COVER_IMAGE from "../images/nav-image.png";
import { DefaultLayout } from "../layouts/default";
import { useLocation } from "react-router-dom";
import { LogoutRequestDenied } from "../components/LogoutRequestDenied";
import { USER_DENIED_LOGOUT } from "../constants/errors";
import { Pet, PetInfo } from "../types/pet";
import AddPet from "./Pets/addPets";
import PetOverview from "./Pets/petOverview";
import PetCard from "./Pets/PetCard";
import { getPets } from "../components/getPetList/get-pets";
import MenuListComposition from "../components/UserMenu";
import { getConfig } from "../util/getConfig";
import { Padding } from "@mui/icons-material";

interface DerivedState {
    authenticateResponse: BasicUserInfo,
    idToken: string[],
    decodedIdTokenHeader: string,
    decodedIDTokenPayload: Record<string, string | number | boolean>;
}

/**
 * Home page for the Sample.
 *
 * @param props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const HomePage: FunctionComponent = (): ReactElement => {

    const {
        state,
        signIn,
        signOut,
        getBasicUserInfo,
        getIDToken,
        getDecodedIDToken,
        on
    } = useAuthContext();
    const [petList, setPetList] = useState<Pet[] | null>(null);
    const [derivedAuthenticationState, setDerivedAuthenticationState] = useState<DerivedState>(null);
    const [hasAuthenticationErrors, setHasAuthenticationErrors] = useState<boolean>(false);
    const [hasLogoutFailureError, setHasLogoutFailureError] = useState<boolean>();
    const [user, setUser] = useState<BasicUserInfo | null>(null);
    const [isAddPetOpen, setIsAddPetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isUpdateViewOpen, setIsUpdateViewOpen] = useState(false);
    const [pet, setPet] = useState<Pet | null>(null);
    const [thumbnail, setThumbnail] = useState(null);
    const { getAccessToken } = useAuthContext();

    const search = useLocation().search;
    const stateParam = new URLSearchParams(search).get('state');
    const errorDescParam = new URLSearchParams(search).get('error_description');

    useEffect(() => {

        if (!state?.isAuthenticated) {
            return;
        }

        (async (): Promise<void> => {
            const basicUserInfo = await getBasicUserInfo();
            setUser(basicUserInfo);
            const idToken = await getIDToken();
            const decodedIDToken = await getDecodedIDToken();
            console.log("decodedIDToken", decodedIDToken);
            

            const derivedState: DerivedState = {
                authenticateResponse: basicUserInfo,
                idToken: idToken.split("."),
                decodedIdTokenHeader: JSON.parse(atob(idToken.split(".")[0])),
                decodedIDTokenPayload: decodedIDToken
            };

            setDerivedAuthenticationState(derivedState);
        })();
    }, [state.isAuthenticated, getBasicUserInfo, getIDToken, getDecodedIDToken]);

    useEffect(() => {
        if (stateParam && errorDescParam) {
            if (errorDescParam === "End User denied the logout request") {
                setHasLogoutFailureError(true);
            }
        }
    }, [stateParam, errorDescParam]);


    async function getPetList() {
        setIsLoading(true);
        const accessToken = await getAccessToken();
        getPets(accessToken)
        .then((res) => {
            if(res.data instanceof Array) {
                setPetList(res.data);
            }       
          setIsLoading(false);
        })
        .catch((e) => {
          console.log(e);
        });    
    }

    useEffect(() => {
        if (!isAddPetOpen) {
            getPetList();
        }
    }, [isAddPetOpen, isOverviewOpen, isUpdateViewOpen]);


    useEffect(() => {
        if(state.isAuthenticated){
            getPetList();
        } 
      }, [state.isAuthenticated]);

    const handleLogin = useCallback(() => {
        setHasLogoutFailureError(false);
        signIn()
            .catch(() => setHasAuthenticationErrors(true));
    }, [signIn]);

    /**
      * handles the error occurs when the logout consent page is enabled
      * and the user clicks 'NO' at the logout consent page
      */
    useEffect(() => {
        on(Hooks.SignOut, () => {
            setHasLogoutFailureError(false);
        });

        on(Hooks.SignOutFailed, () => {
            if (!errorDescParam) {
                handleLogin();
            }
        })
    }, [on, handleLogin, errorDescParam]);

    const handleLogout = () => {
        signOut();
    };

    // If `clientID` is not defined in `config.json`, show a UI warning.
    if (!getConfig().clientID) {

        return (
            <div className="content">
                <h2>You need to update the Client ID to proceed.</h2>
                <p>Please open &quot;src/config.json&quot; file using an editor, and update
                    the <code>clientID</code> value with the registered application&apos;s client ID.</p>
                <p>Visit repo <a
                    href="https://github.com/asgardeo/asgardeo-auth-react-sdk/tree/master/samples/asgardeo-react-app">README</a> for
                    more details.</p>
            </div>
        );
    }

    if (hasLogoutFailureError) {
        return (
            <LogoutRequestDenied
                errorMessage={USER_DENIED_LOGOUT}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
            />
        );
    }

    if (!state.isAuthenticated) {
        return (
            <DefaultLayout
                isLoading={state.isLoading}
                hasErrors={hasAuthenticationErrors}
            >
                {
                
                    <div className="signInDiv">
                        <img
                            style={{ width: "20vw" }}
                            src={LOGO_IMAGE}
                            alt="pet-care-logo"
                        />
                    <div >
                    <div 
                        className="signInDiv2">

                    </div>
                    <label>
                        From Seedling to Supermarket: Partnering for a Healthier Tomorrow
                    </label>
                    <br />
                    <br/>
                    <br/>
                                
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            className="get-started-btn"
                            style={{ marginBottom: '10px' }}
                            onClick={() => {
                                handleLogin();
                            }}
                        >
                            Get Started
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={() => {
                            }}
                        >
                            See Demo
                        </button>
                    </div>
                    </div>
                    <div className="signInDiv3">
                    </div>
                    <br /> 
                    <img
                        style={{ width: "80%" }}
                        src={HOME_PAGE_IMAGE}
                        alt="pet-care-logo"
                    />
                    </div>
                }
            </DefaultLayout>
        )
    }

    return (
        <><nav className="header">
            <div>
                {user && (
                    <MenuListComposition user={user} signout={signOut} />
                )}
            </div>
            <div className="app-title-style">
                <img
                    style={{ width: "3vw"}}
                    src={LOGO_THUMBNAIL_IMAGE}
                    alt="pet-care-logo"
                />
            </div>
            <p className="wording-style">City Vet Hospital</p>
        </nav>
            <div className="cover-div">
                <div className="cover-row ">
                    <div className="cover-column-left">
                        <b>Welcome to</b>
                        <br />
                        <br />
                        <img
                            style={{ width: "15vw"}}
                            src={LOGO_IMAGE}
                            alt="pet-care-logo"
                        />
                        <br />
                        Best pet care starts here.
                        <br />
                        <br />
                        <br />
                        <div className="tagline">
                            <p>
                                Schedule appointments & keep your furry friend healthy – all at your fingertips.
                            </p>
                        </div>
                    </div>
                    <div className="cover-column-right">
                        {/* <div className="cover-img"> */}
                        <img
                            style={{ width: "40vh", height: "40vh"}}
                            src={COVER_IMAGE}
                            alt="cover-image"
                        />
                    </div>
                </div>
            </div>
            <div className="my-pets">
                <label className="home-wording">
                    My Pets 
                </label>
                <br />
                <br />
                <button className="add-pet-btn" onClick={() => setIsAddPetOpen(true)}>
                    Add
                </button>
            </div>
            {petList &&(
                <div className="table-view">
                {/* <Grid container item lg={10} md={10} sm={12} xs={12}> */}
                    <Grid container item spacing={10}>
                        {petList.map((pet) => (
                            <Grid
                                item
                                key={pet.name}
                                xs={4}
                                sm={4}
                                md={4}
                                lg={4}
                                className="grid-item"
                                onClick={() => {
                                    setIsOverviewOpen(true);
                                    setPet(pet);
                                }}
                            >
                                <PetCard
                                    petId={pet.id}
                                    petName={pet.name}
                                    breed={pet.breed}
                                    petThumbnail={thumbnail}
                                    setPetThumbnail={setThumbnail}
                                    isAuthenticated={state.isAuthenticated}
                                    setIsHomeLoading={setIsLoading}
                                    isUpdateViewOpen={isUpdateViewOpen}
                                />
                            </Grid>
                        ))}
                    </Grid>
                {/* </Grid> */}
            </div>
            )}
            <div>
                <AddPet isOpen={isAddPetOpen} setIsOpen={setIsAddPetOpen} />
            </div>
            <div>
                <PetOverview 
                isOpen={isOverviewOpen} 
                setIsOpen={setIsOverviewOpen} 
                isUpdateViewOpen={isUpdateViewOpen} 
                setIsUpdateViewOpen={setIsUpdateViewOpen} 
                pet={pet}
                petThumbnail={thumbnail}
                setPetThumbnail={setThumbnail} />
            </div>
        </>
    );
};