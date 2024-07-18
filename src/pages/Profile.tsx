import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRight } from "../assets/svg/keyboardArrowRightIcon.svg";
import { ReactComponent as HomeIcon } from "../assets/svg/homeIcon.svg";
import ListingItem from "../components/ListingItem";
import Spinner from "../components/Spinner";

interface Listings {
  id: string;
  data: DocumentData;
}

const Profile = () => {
  const auth = getAuth();
  const [listings, setListings] = useState<Listings[]>([]);
  const [loading, setLoading] = useState(true);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName,
    email: auth.currentUser?.email,
  });
  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, "listings");

      // create query
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser?.uid)
      );
      const querySnap = await getDocs(q);

      let listings: Listings[] = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };
    fetchUserListings();
  }, [auth.currentUser?.uid]);

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

  const onDelete = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingId));

      const updatedListings = listings.filter(
        (listing: Listings) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };

  const onEdit = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

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

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing: any) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listings={listing.data}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
