import profilePic from '../../assets/img/me.png';
import '../../assets/styles/main.css'

function Profile() {
    return(
          <div class="profile-holder">
            <img class="profile-pic" src={profilePic}></img>
            <h1 class="profile-heading">KOLVIN LIU</h1>
          </div>
        );
}

export default Profile;