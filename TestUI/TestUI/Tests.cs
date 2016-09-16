using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Xamarin.UITest;
using Xamarin.UITest.Queries;

namespace TestUI
{
    [TestFixture(Platform.Android)]
    //[TestFixture(Platform.iOS)]
    public class Tests
    {
        IApp app;
        Platform platform;

        public Tests(Platform platform)
        {
            this.platform = platform;
        }

        [SetUp]
        public void BeforeEachTest()
        {
            app = AppInitializer.StartApp(platform);
        }

        [Test]
        public void AppLaunches()
        {
            app.Repl();

            Func<AppQuery, AppQuery> title = (arg) => arg.Marked("Eat Evolution");
            Func<AppQuery, AppQuery> barFofoGarden = (arg) => arg.Marked("Bar Fofo Garden");
            Func<AppQuery, AppQuery> filtersButton = (arg) => arg.Class("ActionMenuItemView").Marked("Filters");

            // 1 - info page
            app.WaitForElement(title);
            app.Screenshot("1 - info page");
            Assert.IsNotNull(app.Query("JOIN US OR RECOMMEND").First().Text);

            app.TapCoordinates(100, 300);

            // 2 - list
            app.WaitForElement(barFofoGarden);
            app.Screenshot("2 - list");

            app.Tap(barFofoGarden);

            // 3 - Fofo Garden detail
            app.WaitForElement(barFofoGarden);
            app.Screenshot("3 - Fofo Garden detail");
            Assert.IsNotNull(app.Query("Bar Fofo Garden").First().Text);

            app.TapCoordinates(100, 100);
            app.WaitForElement(barFofoGarden);
            app.Tap(filtersButton);

            // 4 - filters screen
            app.WaitForElement(x => x.Marked("Confirm"));
            app.Screenshot("4 - filters screen");
            Assert.IsNotNull(app.Query("Confirm").First().Text);
            Assert.IsNotNull(app.Query("Cancel").First().Text);

            app.Back();
        }
    }
}
