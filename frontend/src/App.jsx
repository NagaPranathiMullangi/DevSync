import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Premium from "./components/Premium";
import Chat from "./components/Chat";
import IgnoredUsersList from "./components/IgnoredUsersList";
import ViewProfile from "./components/ViewProfile";
import Home from "./components/Home";   // ⭐ ADD THIS
import VerifiedUsers from "./components/VerifiedUsers"

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>

            {/* ⭐ HOME PAGE FIRST */}
            <Route index element={<Home />} />

            {/* ⭐ feed only after login */}
            <Route path="feed" element={<Feed />} /> 

            <Route path="login" element={<Login />} />
            <Route path="ignored/:type" element={<IgnoredUsersList />} />
            <Route path="profile/view/:id" element={<ViewProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="connections" element={<Connections />} />
            <Route path="requests" element={<Requests />} />
            <Route path="premium" element={<Premium />} />
            <Route path="chat/:targetUserId" element={<Chat />} />
            <Route path="/verified-users" element={<VerifiedUsers />} />

             
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
