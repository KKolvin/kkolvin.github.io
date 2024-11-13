import profilePic from '../../assets/img/me.png';
import '../../assets/styles/main.css'

function Profile() {
    return(
          <div class="profile-holder">

            <img class="profile-pic" src={profilePic}></img>
            <div class="profile-background"></div>
            <h1 class="profile-heading" id="first">KOLVIN LIU</h1>
            <h1 class="profile-heading" id="second">KOLVIN LIU</h1>

          </div>
        );
}

export default Profile;