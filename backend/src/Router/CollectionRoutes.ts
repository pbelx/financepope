import { Router } from "express";
import { JWTAuthMiddleWare } from "../Middlewares/AuthMiddleware";
import {
  handleCreateCollection,
  handleGetBalance,
  handleGetMemberCollections,
  handleGetCollections,
  handleUpdateCollection,
  handleConfirmCollection,
  handleRejectCollection,
} from "../Controllers/CollectionController";

export default (router: Router) => {
  const collectionsPrefix = "/collections";

  // GET all collections
  router.get(
    `${collectionsPrefix}`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleGetCollections(req, res).catch(next);
    }
  );

  // POST create new collection
  router.post(
    `${collectionsPrefix}`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleCreateCollection(req, res).catch(next);
    }
  );

  // PUT update collection
  router.put(
    `${collectionsPrefix}`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleUpdateCollection(req, res).catch(next);
    }
  );

  // GET user balance
  router.get(
    `${collectionsPrefix}/balance/:userId`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleGetBalance(req, res).catch(next);
    }
  );

  // GET member collections
  router.get(
    `${collectionsPrefix}/member/:memberId`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleGetMemberCollections(req, res).catch(next);
    }
  );

  // PUT confirm collection
  router.put(
    `${collectionsPrefix}/:id/confirm`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleConfirmCollection(req, res).catch(next);
    }
  );

  // PUT reject collection
  router.put(
    `${collectionsPrefix}/:id/reject`,
    JWTAuthMiddleWare,
    (req, res, next) => {
      handleRejectCollection(req, res).catch(next);
    }
  );
};