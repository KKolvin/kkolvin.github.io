import profilePic from '../../assets/img/me.png';
import '../../assets/styles/main.css'

function Profile() {
    return(
          <div class="profile-holder">

              <img class="profile-pic" src={profilePic}></img>
              <div class="profile-background"><h1 class="profile-heading" id="first">KOLVIN LIU</h1></div>
              
              <h1 class="profile-heading" id="heading-filter">KOLVIN LIU</h1>

          </div>
        );
}

export default Profile;