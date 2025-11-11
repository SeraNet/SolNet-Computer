import { useEffect, useState } from "react";

interface SearchHighlightInfo {
  searchId: string;
  searchType: string;
  searchTitle: string;
  searchSubtitle: string;
}

export function useSearchHighlight() {
  const [searchInfo, setSearchInfo] = useState<SearchHighlightInfo | null>(
    null
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get("searchId");
    const searchType = urlParams.get("searchType");
    const searchTitle = urlParams.get("searchTitle");
    const searchSubtitle = urlParams.get("searchSubtitle");

    if (searchId && searchType && searchTitle) {
      setSearchInfo({
        searchId,
        searchType,
        searchTitle,
        searchSubtitle: searchSubtitle || "",
      });

      // Clear the URL parameters after reading them
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("searchId");
      newUrl.searchParams.delete("searchType");
      newUrl.searchParams.delete("searchTitle");
      newUrl.searchParams.delete("searchSubtitle");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, []);

  const isHighlighted = (item: any, type: string) => {
    if (!searchInfo) return false;

    // Check if this item matches the search criteria
    if (searchInfo.searchType === type) {
      // For different types, check different properties
      switch (type) {
        case "customer":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "device":
          return (
            item.id === searchInfo.searchId ||
            item.problemDescription
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "sale":
          return (
            item.id === searchInfo.searchId ||
            item.paymentMethod
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "inventory":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "brand":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "model":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "accessory":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        case "service":
          return (
            item.id === searchInfo.searchId ||
            item.name
              ?.toLowerCase()
              .includes(searchInfo.searchTitle.toLowerCase())
          );
        default:
          return item.id === searchInfo.searchId;
      }
    }
    return false;
  };

  const getHighlightClass = (item: any, type: string) => {
    return isHighlighted(item, type)
      ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 border-blue-200"
      : "";
  };

  const scrollToHighlighted = (item: any, type: string) => {
    if (isHighlighted(item, type)) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        const element = document.querySelector(`[data-highlighted="true"]`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  };

  const clearSearchInfo = () => {
    setSearchInfo(null);
  };

  return {
    searchInfo,
    isHighlighted,
    getHighlightClass,
    scrollToHighlighted,
    clearSearchInfo,
  };
}
