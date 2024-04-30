let winheight, containerHeight, trackLength, throttlescroll;
let homePhotos = {};
let likedPhotos = [];
let scrollPos = 0;
let cursor = null;
let queryHasMore = false;
let isHomeCursor = true;
let gettingMoreImages = false;
let locationStr = "";
let userId;
let loginFormState = "login";
const body = document.querySelector(".body-3");
const loginButton = document.querySelector(".loginbutton");
const searchForm = document.querySelector(".photo_search");
const homeText = document.querySelector(".homelinkfull");
const homeTextFs = document.querySelector(".homelinkfullfs");
const fullScreenImage = document.querySelector(".lightroom_photo");
const fullScreenInput = document.querySelector(".photo_search_full_screen");
const loginContainer = document.querySelector(".loginsection");
const masonWrap = document.querySelector("._2024_masonary_wrap");
const loginTextButton = document.querySelector(".logintextbutton");
const signupTextButton = document.querySelector(".signuptextbutton");
const usernameTextField = document.getElementById("signup-username");
const usernameLabel = document.querySelector(".username_label");
const authButton = document.querySelector(".auth-form__button");
function addEllipsis(inputElem) {
  if (inputElem.value.endsWith("...")) {
    inputElem.value = inputElem.value.replace(/\./g, "");
  } else {
    inputElem.value = inputElem.value + ".";
  }
}

function removeEllipsis(inputElem) {
  inputElem.value = inputElem.value.replace(/\./g, "");
}

function addEllipsisPlaceholder(inputElem) {
  if (inputElem.placeholder.endsWith("...")) {
    inputElem.placeholder = inputElem.placeholder.replace(/\./g, "");
  } else {
    inputElem.placeholder = inputElem.placeholder + ".";
  }
}

function removeEllipsisPlaceholder(inputElem) {
  inputElem.placeholder = inputElem.placeholder.replace(/\./g, "");
}

function addEllipsisInnerHtml(inputElem, clear = true) {
  if (inputElem.innerHTML.endsWith("...")) {
    inputElem.innerHTML = clear ? inputElem.innerHTML.replace(/\./g, "") : ".";
  } else {
    inputElem.innerHTML = inputElem.innerHTML + ".";
  }
}

function removeEllipsisInnerHtml(inputElem, clear = true) {
  inputElem.innerHTML = clear ? inputElem.innerHTML.replace(/\./g, "") : "";
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function amountscrolled() {
  var scrollTop = window.pageYOffset;
  return Math.abs(Math.floor((scrollTop / trackLength) * 100));
}
function getContainerHeight() {
  return document.querySelector("._2024_masonary_container").clientHeight;
}

window.addEventListener("resize", function () {
  getmeasurements();
});

let portrait = window.matchMedia("(orientation: portrait)");
const landscape = document.querySelector(".landscape");
portrait.addEventListener("change", function (e) {
  if (e.matches) {
    landscape.style["display"] = "none";
  } else {
    if (window.orientation > 1) landscape.style["display"] = "flex";
  }
});

const dropZone = document.querySelector(".photo_search_container");
dropZone.addEventListener("drop", dropHandler);
dropZone.addEventListener("dragover", dragOverHandler);

const dropZoneFs = document.querySelector(".fs_photo_search_container");
dropZoneFs.addEventListener("drop", dropHandler);
dropZoneFs.addEventListener("dragover", dragOverHandler);

function getmeasurements() {
  winheight = window.innerHeight;
  containerHeight = getContainerHeight();
  trackLength = containerHeight - winheight;
}

function getImageString(imageBytes) {
  return `data:image/jpeg;base64,${imageBytes}`;
}

var macy = new Macy({
  container: "._2024_masonary_container",
  trueOrder: true,
  margin: {
    x: 100,
    y: 120,
  },
  columns: 5,
  breakAt: {
    1200: {
      columns: 4,
      margin: {
        x: 100,
        y: 140,
      },
    },
    940: {
      columns: 3,
      margin: {
        x: 25,
        y: 45,
      },
    },
  },
});
setInterval(() => {
  macy.recalculate(true, true);
}, 16.7);
function dragOverHandler(ev) {
  ev.preventDefault();
}
async function dropHandler(ev) {
  ev.preventDefault();
  searchForm.value = "";
  searchForm.placeholder = "Uploading";
  fullScreenInput.placeholder = "Uploading";
  const ellipsis = setInterval(addEllipsisPlaceholder, 300, searchForm);
  const ellipsisFs = setInterval(addEllipsisPlaceholder, 300, fullScreenInput);

  const queryStr = `https://openaisearch-x2uakky4oa-uc.a.run.app`;
  if (ev.dataTransfer.items) {
    [...ev.dataTransfer.items].forEach(async (item, i) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        const bytes = await toBase64(file);
        searchForm.placeholder = "Analyzing";
        fullScreenInput.placeholder = "Analyzing";
        const res = await axios.post(queryStr, {
          data: {
            image_bytes: bytes,
          },
        });
        cursor = res.data.cursor;
        queryHasMore = res.data.hasMore;
        const display = displayThumbnails(res.data.successImages, true);
        if (display) {
          isHomeCursor = false;
          homeText.style["display"] = "flex";
          homeTextFs.style["display"] = "flex";
        }
        closeFullScreen();
        searchForm.placeholder = "Search";
        fullScreenInput.placeHolder = "Search";
        clearInterval(ellipsis);
        clearInterval(ellipsisFs);
        removeEllipsisPlaceholder(searchForm);
        removeEllipsisPlaceholder(fullScreenInput);
      }
    });
  }
}

async function getIp() {
  const res = await axios.get(
    "https://ipapi.co/json/?key=EyKN7koyk6do6KNf3wRYim11b5SlBjmmfrvK3aY1qGmtndElzb"
  );
  locationStr = `${res.data.region}, ${res.data.country_name}`;
}

async function openFullScreenMode(ev) {
  const clickedImage = ev.target;
  document
    .querySelectorAll("div._2024_image_wrap")
    .forEach((e) => (e.style["opacity"] = 0));
  setTimeout(
    () =>
      document
        .querySelectorAll("._2024_topbot_wrap")
        .forEach((e) => (e.style["opacity"] = 0)),
    500
  );
  const path = clickedImage.attributes.getNamedItem("data-file-path").value;
  const filename = clickedImage.attributes.getNamedItem("data-file-name").value;
  const queryStr = `https://fullscreenimage-x2uakky4oa-uc.a.run.app?path=${path}`;
  const overlay = document.querySelector(".full-screen-image-container");
  const fileNameEl = document.querySelector(".file-name-text");

  fullScreenImage.loading = "eager";
  fullScreenImage.srcset = "";
  fullScreenImage.src = "";
  body.style["overflow"] = "hidden";
  const res = await axios.get(queryStr);
  window.scrollTo({
    top: 1,
    left: 0,
    behavior: "instant",
  });
  overlay.style["display"] = "flex";
  if (likedPhotos.some((p) => p.path === path)) {
    fileNameEl.textContent = "Liked";
  } else {
    fileNameEl.textContent = "Like";
  }
  fullScreenImage.src = getImageString(res.data.image_bytes);
  document
    .querySelectorAll(".fullscreenfade")
    .forEach((e) => (e.style["opacity"] = 1));
  fullScreenImage.style["opacity"] = 1;
  fullScreenImage.setAttribute("data-file-path", path);
  fullScreenImage.setAttribute("data-file-name", filename);
}

function closeFullScreen() {
  const body = document.querySelector(".body-3");
  const overlay = document.querySelector(".full-screen-image-container");
  body.style["overflow"] = "auto";
  overlay.style["display"] = "none";
  document
    .querySelectorAll(".fullscreenfade")
    .forEach((e) => (e.style["opacity"] = 0));
  setTimeout(
    () =>
      document
        .querySelectorAll("._2024_topbot_wrap")
        .forEach((e) => (e.style["opacity"] = 1)),
    250
  );
  setTimeout(
    () =>
      document
        .querySelectorAll("div._2024_image_wrap")
        .forEach((e) => (e.style["opacity"] = 1)),
    750
  );
  window.scrollTo({
    top: Math.abs(scrollPos),
    left: 0,
    behavior: "instant",
  });
}

loginTextButton.addEventListener("click", () => {
  loginFormState = "login";
  usernameTextField.style["display"] = "none";
  usernameTextField.required = false;
  usernameLabel.style["display"] = "none";
  authButton.value = "Login";
  loginTextButton.classList.add("active");
  signupTextButton.classList.remove("active");
});

signupTextButton.addEventListener("click", () => {
  loginFormState = "signup";
  loginTextButton.classList.remove("active");
  signupTextButton.classList.add("active");
  usernameTextField.style["display"] = "block";
  usernameTextField.required = true;
  usernameLabel.style["display"] = "block";
  authButton.value = "Sign Up";
});

window.addEventListener("scroll", async function (ev) {
  if (document.body.getBoundingClientRect().top != -1) {
    scrollPos = document.body.getBoundingClientRect().top;
  }
  clearTimeout(throttlescroll);
  throttlescroll = setTimeout(async function () {
    const isScrollDown = document.body.getBoundingClientRect().top <= scrollPos;
    if (
      isScrollDown &&
      amountscrolled() >= 25 &&
      !gettingMoreImages &&
      queryHasMore
    ) {
      gettingMoreImages = true;
      const ellipsistextblock = document.querySelector(".ellipsistextblock");
      ellipsistextblock.style["display"] = "flex";
      const ellipsis = setInterval(
        addEllipsisInnerHtml,
        300,
        ellipsistextblock,
        false
      );
      const searchContinue = `https://searchcontinue-x2uakky4oa-uc.a.run.app?cursor=${cursor}`;
      const homeContinue = `https://homecontinue-x2uakky4oa-uc.a.run.app?cursor=${cursor}`;
      const queryStr = isHomeCursor ? homeContinue : searchContinue;
      try {
        const res = await axios.get(queryStr);
        cursor = res.data.cursor;
        queryHasMore = res.data.hasMore;
        displayThumbnails(res.data.successImages, false);
        gettingMoreImages = false;
        clearInterval(ellipsis);
        ellipsistextblock.style["display"] = "none";
      } catch (err) {
        console.log(err);
      }
    }
  }, 50);
});
async function getHomePagePhotos() {
  try {
    const queryStr = `https://homeimages-x2uakky4oa-uc.a.run.app`;
    const res = await axios.get(queryStr);
    cursor = res.data.cursor;
    queryHasMore = res.data.hasMore;
    displayThumbnails(res.data.successImages);
    setInterval(() => {
      document
        .querySelectorAll("div._2024_image_wrap")
        .forEach((e) => (e.style["opacity"] = 1));
    }, 200);
    homePhotos = res.data;
  } catch (err) {
    console.error(err);
  }
}
async function searchImages(query) {
  const queryStr = `https://searchimage-x2uakky4oa-uc.a.run.app?q=${query}`;
  const input = document.querySelector(".photo_search");
  try {
    const res = await axios.get(queryStr);
    cursor = res.data.cursor;
    queryHasMore = res.data.hasMore;
    const didDisplay = displayThumbnails(res.data.successImages);
    if (didDisplay) {
      isHomeCursor = false;
      homeText.style["display"] = "flex";
      homeTextFs.style["display"] = "flex";
      setInterval(() => {
        document
          .querySelectorAll("div._2024_image_wrap")
          .forEach((e) => (e.style["opacity"] = 1));
      }, 200);
    } else {
      input.value = "";
    }
    input.style["color"] = "#a5a5a5";
  } catch (err) {
    console.error(err);
  }
}

function displayThumbnails(images, removePrevious = true) {
  if (!images || images.length === 0) {
    const input = document.querySelector(".photo_search");
    input.placeholder = "Oops. Try Again!";
    return false;
  }
  if (removePrevious) {
    document.querySelectorAll("div._2024_image_wrap").forEach((e) => {
      e.removeEventListener("click", openFullScreenMode);
      e.remove();
    });
  }
  const parentWrapper = document.querySelector("div._2024_masonary_container");
  for (let image of images) {
    const wrapperElem = document.createElement("div");
    wrapperElem.classList.add("_2024_image_wrap");
    const imgElem = document.createElement("img");
    imgElem.addEventListener("click", openFullScreenMode);
    imgElem.classList.add("_2024_book_image");
    imgElem.srcSet = getImageString(image.thumbnail);
    imgElem.src = getImageString(image.thumbnail);
    imgElem.setAttribute("data-file-name", image.filename);
    imgElem.setAttribute("data-file-path", image.path);
    wrapperElem.appendChild(imgElem);
    wrapperElem.style["opacity"] = 0;
    parentWrapper.appendChild(wrapperElem);
  }
  return true;
}
getHomePagePhotos();
getmeasurements();
getIp();
const imageContainer = document.querySelector("div._2024_masonary_container");
loginButton.addEventListener("click", () => {
  if (!userId) {
    if (body.style["justify-content"] === "center") {
      body.style["justify-content"] = "flex-start";
      masonWrap.style["display"] = "flex";
      loginContainer.style["display"] = "none";
      loginButton.textContent = "Login";
      homeText.style["display"] = "none";
      homeTextFs.style["display"] = "none";
      return;
    }
    homeText.style["display"] = "flex";
    homeTextFs.style["display"] = "flex";
    body.style["justify-content"] = "center";
    masonWrap.style["display"] = "none";
    loginContainer.style["display"] = "flex";
    loginButton.textContent = "Close";

    if (loginFormState === "signup") {
      usernameTextField.style["display"] = "block";
      usernameLabel.style["display"] = "block";
    } else {
      usernameTextField.style["display"] = "none";
      usernameLabel.style["display"] = "none";
    }
  } else {
    //TODO add liked page.
    homeText.style["display"] = "flex";
    homeTextFs.style["display"] = "flex";
    displayThumbnails(likedPhotos);
  }
});
loginTextButton.addEventListener("click", () => {
  loginFormState = "login";
  usernameTextField.style["display"] = "none";
  usernameTextField.required = false;
  usernameLabel.style["display"] = "none";
  authButton.value = "Login";
  loginTextButton.classList.add("active");
  signupTextButton.classList.remove("active");
});

signupTextButton.addEventListener("click", () => {
  loginFormState = "signup";
  loginTextButton.classList.remove("active");
  signupTextButton.classList.add("active");
  usernameTextField.style["display"] = "block";
  usernameTextField.required = true;
  usernameLabel.style["display"] = "block";
  authButton.value = "Sign Up";
});

const similarButton = document.querySelector(".similar-button");
similarButton.addEventListener("click", async (ev) => {
  const centerImage = document.querySelector(".lightroom_photo");
  const path = centerImage.attributes.getNamedItem("data-file-path").value;
  const queryStr = `https://similarimages-x2uakky4oa-uc.a.run.app?path=${path}`;
  similarButton.content = "Searching";
  const ellipsis = setInterval(addEllipsisInnerHtml, 300, similarButton);
  let res;
  let tempIsHomeCursor;
  if (isHomeCursor) {
    res = await axios.post("https://openaisearch-x2uakky4oa-uc.a.run.app", {
      data: {
        image_bytes: centerImage.src,
      },
    });
    tempIsHomeCursor = false;
  } else {
    res = await axios.get(queryStr);
    tempIsHomeCursor = true;
  }
  clearInterval(ellipsis);
  removeEllipsisInnerHtml(similarButton);
  closeFullScreen();
  const display = displayThumbnails(res.data.successImages);
  if (display) {
    window.scrollTo({
      top: 1,
      left: 0,
      behavior: "instant",
    });
    isHomeCursor = tempIsHomeCursor;
    queryHasMore = res.data.hasMore;
    cursor = res.data.cursor;
    searchForm.value = "";
    searchForm.placeholder = "Search";
    removeEllipsisPlaceholder(searchForm);
    homeText.style["display"] = "flex";
    homeTextFs.style["display"] = "flex";
  }
});

fullScreenImage.addEventListener("click", closeFullScreen);

homeText.addEventListener("click", async () => {
  await goToHomePage();
});

homeTextFs.addEventListener("click", async () => {
  await goToHomePage();
});

const goToHomePage = async () => {
  closeFullScreen();
  cursor = homePhotos.cursor;
  queryHasMore = homePhotos.hasMore;
  displayThumbnails(homePhotos.successImages);
  setInterval(() => {
    document
      .querySelectorAll("div._2024_image_wrap")
      .forEach((e) => (e.style["opacity"] = 1));
  }, 200);
  isHomeCursor = true;
  searchForm.value = "";
  searchForm.placeholder = "Search";
  homeText.style["display"] = "none";
  homeTextFs.style["display"] = "none";
  window.scrollTo({
    top: 1,
    left: 0,
    behavior: "instant",
  });
};

const filenameEl = document.querySelector(".file-name-text");
filenameEl.addEventListener("click", async () => {
  const filename =
    fullScreenImage.attributes.getNamedItem("data-file-name").value;
  const path = fullScreenImage.attributes.getNamedItem("data-file-path").value;
  if (filenameEl.textContent === "Like") {
    navigator.clipboard.writeText(filename);
    filenameEl.textContent = "Yay!";
    setTimeout(() => {
      filenameEl.textContent = "Liked";
    }, 1000);
    await axios.post("https://like-x2uakky4oa-uc.a.run.app", {
      data: {
        userId,
        filename,
        path,
        location: locationStr,
      },
    });
  } else {
    filenameEl.textContent = "Unliked";
    setTimeout(() => {
      filenameEl.textContent = "Like";
    }, 1000);
    await axios.post("https://unlike-x2uakky4oa-uc.a.run.app", {
      data: {
        userId,
        path,
      },
    });
  }
  //get userLiked images
  const res = await axios.get(
    `https://getlikedimages-x2uakky4oa-uc.a.run.app?userid=${userId}`
  );
  likedPhotos = res.data;
});
searchForm.addEventListener("keydown", async function (event) {
  searchForm.style["color"] = "#4d4d4d";
  if (event.keyCode === 13) {
    searchForm.blur();
    const ellipsis = setInterval(addEllipsis, 300, searchForm);
    await searchImages(event.target.value);
    removeEllipsis(searchForm);
    clearInterval(ellipsis);
  }
});
searchForm.addEventListener("focus", (ev) => {
  searchForm.placeholder = "";
});
searchForm.addEventListener("blur", (ev) => {
  searchForm.placeholder = "Search";
});

fullScreenInput.addEventListener("keydown", async function (event) {
  fullScreenInput.style["color"] = "#4d4d4d";
  if (event.keyCode === 13) {
    const ellipsis = setInterval(addEllipsis, 300, fullScreenInput);
    fullScreenInput.blur();
    searchForm.value = event.target.value;
    await searchImages(event.target.value);
    clearInterval(ellipsis);
    fullScreenInput.style["color"] = "#a5a5a5";
    fullScreenInput.value = "";
    closeFullScreen();
  }
});

fullScreenInput.addEventListener("focus", (ev) => {
  fullScreenInput.placeholder = "";
});

fullScreenInput.addEventListener("blur", (ev) => {
  fullScreenInput.placeholder = "Search";
});

window.addEventListener("scroll", async function (ev) {
  if (document.body.getBoundingClientRect().top != -1) {
    scrollPos = document.body.getBoundingClientRect().top;
  }
  clearTimeout(throttlescroll);
  throttlescroll = setTimeout(async function () {
    const isScrollDown = document.body.getBoundingClientRect().top <= scrollPos;
    if (
      isScrollDown &&
      amountscrolled() >= 25 &&
      !gettingMoreImages &&
      queryHasMore
    ) {
      gettingMoreImages = true;
      const ellipsistextblock = document.querySelector(".ellipsistextblock");
      ellipsistextblock.style["display"] = "flex";
      const ellipsis = setInterval(
        addEllipsisInnerHtml,
        300,
        ellipsistextblock,
        false
      );
      const searchContinue = `https://searchcontinue-x2uakky4oa-uc.a.run.app?cursor=${cursor}`;
      const homeContinue = `https://homecontinue-x2uakky4oa-uc.a.run.app?cursor=${cursor}`;
      const queryStr = isHomeCursor ? homeContinue : searchContinue;
      try {
        const res = await axios.get(queryStr);
        cursor = res.data.cursor;
        queryHasMore = res.data.hasMore;
        displayThumbnails(res.data.successImages, false);
        gettingMoreImages = false;
        clearInterval(ellipsis);
        ellipsistextblock.style["display"] = "none";
      } catch (err) {
        console.log(err);
      }
    }
  }, 50);
});
async function getHomePagePhotos() {
  try {
    const queryStr = `https://homeimages-x2uakky4oa-uc.a.run.app`;
    const res = await axios.get(queryStr);
    cursor = res.data.cursor;
    queryHasMore = res.data.hasMore;
    displayThumbnails(res.data.successImages);
    setInterval(() => {
      document
        .querySelectorAll("div._2024_image_wrap")
        .forEach((e) => (e.style["opacity"] = 1));
    }, 200);
    homePhotos = res.data;
  } catch (err) {
    console.error(err);
  }
}
async function searchImages(query) {
  const queryStr = `https://searchimage-x2uakky4oa-uc.a.run.app?q=${query}`;
  const input = document.querySelector(".photo_search");
  try {
    const res = await axios.get(queryStr);
    cursor = res.data.cursor;
    queryHasMore = res.data.hasMore;
    const didDisplay = displayThumbnails(res.data.successImages);
    if (didDisplay) {
      isHomeCursor = false;
      homeText.style["display"] = "flex";
      homeTextFs.style["display"] = "flex";
      setInterval(() => {
        document
          .querySelectorAll("div._2024_image_wrap")
          .forEach((e) => (e.style["opacity"] = 1));
      }, 200);
    } else {
      input.value = "";
    }
    input.style["color"] = "#a5a5a5";
  } catch (err) {
    console.error(err);
  }
}

function displayThumbnails(images, removePrevious = true) {
  if (!images || images.length === 0) {
    const input = document.querySelector(".photo_search");
    input.placeholder = "Oops. Try Again!";
    return false;
  }
  if (removePrevious) {
    document.querySelectorAll("div._2024_image_wrap").forEach((e) => {
      e.removeEventListener("click", openFullScreenMode);
      e.remove();
    });
  }
  const parentWrapper = document.querySelector("div._2024_masonary_container");
  for (let image of images) {
    const wrapperElem = document.createElement("div");
    wrapperElem.classList.add("_2024_image_wrap");
    const imgElem = document.createElement("img");
    imgElem.addEventListener("click", openFullScreenMode);
    imgElem.classList.add("_2024_book_image");
    imgElem.srcSet = getImageString(image.thumbnail);
    imgElem.src = getImageString(image.thumbnail);
    imgElem.setAttribute("data-file-name", image.filename);
    imgElem.setAttribute("data-file-path", image.path);
    wrapperElem.appendChild(imgElem);
    wrapperElem.style["opacity"] = 0;
    parentWrapper.appendChild(wrapperElem);
  }
  return true;
}
