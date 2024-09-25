import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaEdit } from "react-icons/fa";
import { doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import defaultProfilePic from '../../images/defaultProfilePic.png';
import "./profilePage.css";

const Profile = () => {
    const navigate = useNavigate();
    const { name } = useParams(); 
    const [userData, setUserData] = useState({ name: '', bio: '', profilePic: defaultProfilePic });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false); 
    const [originalBio, setOriginalBio] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserDataByName(name, user.uid); 
            } else {
                console.log("User is not authenticated.");
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [name]);

    const fetchUserDataByName = async (userName, uid) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("name", "==", userName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; 
            const data = userDoc.data();
            setUserData({
                name: data.name,
                bio: data.bio || '',
                profilePic: data.profilePic || defaultProfilePic
            });
            setOriginalBio(data.bio || ''); // Store the original bio
            setIsOwnProfile(userDoc.id === uid);
        } else {
            console.log("User document does not exist.");
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const saveBio = async () => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        console.log("Saving bio:", userData.bio);
        await setDoc(userRef, { bio: userData.bio }, { merge: true });
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setUserData({ ...userData, bio: originalBio });
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <div className="page-header">
                <div className="home-icon">
                    <FaHome onClick={() => navigate('/')} />
                </div>
            </div>
            <div className="profile-info">
                <img src={userData.profilePic} alt="Profile" className="profile-picture" />
                <div className="user-details">
                    <div className="name-container">
                        <h2>{userData.name}</h2>
                        {isOwnProfile && <FaEdit className="edit-icon" onClick={() => {
                            setIsEditing(true);
                            setOriginalBio(userData.bio);
                        }} />} 
                    </div>
                    <div className="separator"></div>
                    <textarea
                        placeholder="User has no bio yet..." 
                        value={userData.bio} 
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        className="bio-textarea" 
                        disabled={!isEditing || !isOwnProfile} 
                    />
                    {isOwnProfile && ( 
                        <div className={`edit-buttons ${isEditing ? 'visible' : ''}`}>
                            <button className="save-button" onClick={saveBio}>
                                Save Changes
                            </button>
                            <button className="cancel-button" onClick={cancelEdit}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
