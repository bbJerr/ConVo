import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaEdit } from "react-icons/fa";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import defaultProfilePic from '../../images/defaultProfilePic.png';
import "./profilePage.css";

const Profile = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: '', bio: '', profilePic: defaultProfilePic });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserData(user.uid);
            } else {
                console.log("User is not authenticated.");
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = async (uid) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("Fetched user data:", data);
            setUserData({
                name: data.name,
                bio: data.bio || '',
                profilePic: data.profilePic || defaultProfilePic
            });
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
                    <div className="name-container"> {/* New container for name and edit icon */}
                        <h2>{userData.name}</h2>
                        <FaEdit className="edit-icon" onClick={() => setIsEditing(true)} />
                    </div>
                    <div className="separator"></div>
                    <textarea
                        placeholder="Add your bio..." 
                        value={userData.bio} 
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        className="bio-textarea" 
                        disabled={!isEditing} // Disable textarea if not editing
                    />
                    <div className={`edit-buttons ${isEditing ? 'visible' : ''}`}>
                        <button className="save-button" onClick={saveBio}>
                            Save Changes
                        </button>
                        <button className="cancel-button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
