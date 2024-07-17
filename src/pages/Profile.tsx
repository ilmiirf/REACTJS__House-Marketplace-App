import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRight } from "../assets/svg/keyboardArrowRightIcon.svg";
import { ReactComponent as HomeIcon } from "../assets/svg/homeIcon.svg";

const Profile = () => {
  const auth = getAuth();
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName,
    email: auth.currentUser?.email,
  });
  const { name, email } = formData;

  const navigate = useNavigate();

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser?.displayName !== name) {
        // Update display name in fb
        await updateProfile(auth.currentUser!, {
          displayName: name,
        });
        // Update in firestore
        const userRef = doc(db, "users", auth.currentUser!.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }

    setChangeDetails(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  console.log(changeDetails);

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              setChangeDetails((prevState) => !prevState);
              changeDetails && onSubmit();
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <form action="">
            <input
              type="text"
              name="name"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              value={name!}
              onChange={onChange}
            />
            <input
              type="text"
              name="email"
              id="email"
              className={changeDetails ? "profileEmailActive" : "profileEmail"}
              value={email!}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <HomeIcon width="24px" height="24px" />
          <p>Sell or rent your home</p>
          <ArrowRight width="24px" height="24px" />
        </Link>
      </main>
    </div>
  );
};

export default Profile;
